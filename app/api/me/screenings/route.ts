import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, created, handle, requirePermission, HttpError } from "@/lib/api"
import { selfScreeningSchema } from "@/lib/validation"
import { evaluateEpds } from "@/lib/epds"
import { runCdss, followUpDeadline } from "@/lib/cdss"
import { writeAudit, writeActivity, requestMeta } from "@/lib/audit"

export const runtime = "nodejs"

async function getOwnPatient(userId: string) {
  const patient = await prisma.patient.findUnique({ where: { userId } })
  if (!patient) {
    throw new HttpError(404, "NO_PATIENT", "Akun Anda belum tertaut ke data pasien. Silakan hubungi petugas faskes Anda.")
  }
  return patient
}

// POST /api/me/screenings — Ibu mengisi EPDS untuk dirinya sendiri.
// finalize=false => auto-save DRAFT; finalize=true => skoring + CDSS + draft intervensi.
export function POST(req: NextRequest) {
  return handle(async () => {
    const auth = await requirePermission("self:screening")
    const patient = await getOwnPatient(auth.sub)
    const input = selfScreeningSchema.parse(await req.json())

    // --- AUTO-SAVE DRAFT ---
    if (!input.finalize) {
      const existing = await prisma.screening.findFirst({
        where: { patientId: patient.id, status: "DRAFT" },
        orderBy: { startedAt: "desc" },
      })
      const draft = existing
        ? await prisma.screening.update({ where: { id: existing.id }, data: { answers: input.answers as never } })
        : await prisma.screening.create({
            data: { patientId: patient.id, screenedById: auth.sub, status: "DRAFT", answers: input.answers as never },
          })
      return ok({ screening: { id: draft.id, status: draft.status }, savedAt: new Date().toISOString() })
    }

    // --- FINALIZE ---
    if (input.answers.some((a) => a === null)) {
      throw new HttpError(422, "INCOMPLETE", "Lengkapi seluruh 10 pertanyaan sebelum mengirim skrining.")
    }
    const answers = input.answers as number[]
    const result = evaluateEpds(answers)
    const cdss = runCdss(result)
    const now = new Date()

    const screening = await prisma.$transaction(async (tx) => {
      const existingDraft = await tx.screening.findFirst({
        where: { patientId: patient.id, status: "DRAFT" },
        orderBy: { startedAt: "desc" },
      })
      const data = {
        patientId: patient.id,
        screenedById: auth.sub,
        status: "COMPLETED" as const,
        answers: answers as never,
        totalScore: result.total,
        riskLevel: result.riskLevel,
        highAlert: result.highAlert,
        item10Score: result.item10Score,
        cdssVersion: cdss.version,
        cdssOutput: cdss as never,
        completedAt: now,
      }
      const s = existingDraft
        ? await tx.screening.update({ where: { id: existingDraft.id }, data })
        : await tx.screening.create({ data })
      // Auto-create draft intervensi agar klinisi langsung menindaklanjuti.
      if (cdss.suggestedInterventions.length) {
        await tx.intervention.createMany({
          data: cdss.suggestedInterventions.map((i) => ({
            patientId: patient.id,
            screeningId: s.id,
            type: i.type,
            title: i.title,
            status: "PLANNED" as const,
            dueDate: followUpDeadline(now, cdss.followUpSlaHours),
          })),
        })
      }
      return s
    })

    await writeAudit({
      userId: auth.sub, action: "CREATE", entity: "Screening", entityId: screening.id,
      after: { totalScore: result.total, riskLevel: result.riskLevel, highAlert: result.highAlert, self: true },
      ...requestMeta(req),
    })
    await writeActivity({
      userId: auth.sub,
      type: result.highAlert ? "HIGH_ALERT" : "SELF_SCREENING",
      message: result.highAlert
        ? `HIGH ALERT skrining mandiri (item-10 positif) — ${patient.fullName}`
        : `Skrining mandiri selesai: ${result.label} (skor ${result.total}) — ${patient.fullName}`,
      meta: { screeningId: screening.id, self: true },
    })
    // Catatan: hasil hanya menampilkan ringkasan suportif ke Ibu; rekomendasi klinis penuh untuk tenaga kesehatan.
    return created({ screening, result, cdss })
  })
}
