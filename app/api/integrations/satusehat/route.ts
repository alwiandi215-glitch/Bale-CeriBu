import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, handle, requirePermission, HttpError } from "@/lib/api"
import { pushEpdsObservation } from "@/lib/integrations/satusehat"

export const runtime = "nodejs"

// POST /api/integrations/satusehat — Modul 15: kirim hasil EPDS sebagai FHIR Observation.
// Body: { screeningId }
export function POST(req: NextRequest) {
  return handle(async () => {
    await requirePermission("integration:manage")
    const { screeningId } = (await req.json()) as { screeningId: string }
    const screening = await prisma.screening.findUniqueOrThrow({ where: { id: screeningId }, include: { patient: true } })
    if (!screening.patient.satusehatId) throw new HttpError(400, "NO_IHS_ID", "Pasien belum memiliki IHS ID SATUSEHAT")
    if (screening.totalScore == null) throw new HttpError(400, "NOT_SCORED", "Skrining belum terskor")
    const res = await pushEpdsObservation({
      patientSatusehatId: screening.patient.satusehatId,
      totalScore: screening.totalScore,
      effectiveDateTime: (screening.completedAt ?? new Date()).toISOString(),
      screeningId: screening.id,
    })
    return ok(res)
  })
}
