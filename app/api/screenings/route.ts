import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, created, handle, requirePermission, parsePagination } from "@/lib/api"
import { screeningSubmitSchema } from "@/lib/validation"
import { evaluateEpds } from "@/lib/epds"
import { runCdss, followUpDeadline } from "@/lib/cdss"
import { writeAudit, writeActivity, requestMeta } from "@/lib/audit"

export const runtime = "nodejs"

// GET /api/screenings — daftar skrining (filter risiko/highAlert via query).
export function GET(req: NextRequest) {
  return handle(async () => {
    const auth = await requirePermission("screening:read")
    const { skip, take, page, pageSize } = parsePagination(req.url)
    const { searchParams } = new URL(req.url)
    const where: Record<string, unknown> = {}
    const risk = searchParams.get("risk")
    if (risk) where.riskLevel = risk
    if (searchParams.get("highAlert") === "true") where.highAlert = true
    if (searchParams.get("status")) where.status = searchParams.get("status")
    if (auth.facilityId && ["BIDAN", "KADER", "DOKTER", "ADMIN_FASKES"].includes(auth.role)) {
      where.patient = { facilityId: auth.facilityId }
    }
    const [items, total] = await Promise.all([
      prisma.screening.findMany({
        where, skip, take, orderBy: { startedAt: "desc" },
        include: { patient: { select: { id: true, fullName: true, mrn: true } } },
      }),
      prisma.screening.count({ where }),
    ])
    return ok({ items, total, page, pageSize })
  })
}

// POST /api/screenings — Modul 4/5/6: submit final, skoring + CDSS + auto-intervensi.
export function POST(req: NextRequest) {
  return handle(async () => {
    const auth = await requirePermission("screening:write")
    const input = screeningSubmitSchema.parse(await req.json())
    const result = evaluateEpds(input.answers)
    const cdss = runCdss(result)
    const now = new Date()

    const screening = await prisma.$transaction(async (tx) => {
      const s = await tx.screening.create({
        data: {
          patientId: input.patientId,
          screenedById: auth.sub,
          status: "COMPLETED",
          answers: input.answers,
          totalScore: result.total,
          riskLevel: result.riskLevel,
          highAlert: result.highAlert,
          item10Score: result.item10Score,
          cdssVersion: cdss.version,
          cdssOutput: cdss as never,
          completedAt: now,
        },
      })
      // Auto-create draft intervensi sesuai rekomendasi CDSS.
      if (cdss.suggestedInterventions.length) {
        await tx.intervention.createMany({
          data: cdss.suggestedInterventions.map((i) => ({
            patientId: input.patientId,
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

    await writeAudit({ userId: auth.sub, action: "CREATE", entity: "Screening", entityId: screening.id, after: { totalScore: result.total, riskLevel: result.riskLevel, highAlert: result.highAlert }, ...requestMeta(req) })
    if (result.highAlert) {
      await writeActivity({ userId: auth.sub, type: "HIGH_ALERT", message: `HIGH ALERT baru (item-10 positif) untuk pasien ${input.patientId}`, meta: { screeningId: screening.id } })
    } else {
      await writeActivity({ userId: auth.sub, type: "SCREENING_SUBMITTED", message: `Skrining selesai: ${result.label} (skor ${result.total})`, meta: { screeningId: screening.id } })
    }
    return created({ screening, result, cdss })
  })
}
