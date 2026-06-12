import { prisma } from "@/lib/prisma"
import { ok, handle, requirePermission, HttpError } from "@/lib/api"

export const runtime = "nodejs"

// GET /api/me — Portal Ibu: profil + riwayat skrining + kondisi terkini (self-monitoring).
export function GET() {
  return handle(async () => {
    const auth = await requirePermission("self:monitoring")
    const patient = await prisma.patient.findUnique({
      where: { userId: auth.sub },
      include: {
        facility: { select: { name: true, phone: true } },
        screenings: {
          orderBy: { startedAt: "desc" },
          take: 20,
          select: {
            id: true, status: true, totalScore: true, riskLevel: true,
            highAlert: true, startedAt: true, completedAt: true,
          },
        },
      },
    })
    if (!patient) {
      throw new HttpError(404, "NO_PATIENT", "Akun Anda belum tertaut ke data pasien. Silakan hubungi petugas faskes Anda.")
    }
    const completed = patient.screenings.filter((s) => s.status !== "DRAFT")
    const latest = completed[0] ?? null
    const draft = patient.screenings.find((s) => s.status === "DRAFT") ?? null
    return ok({
      patient: {
        id: patient.id,
        fullName: patient.fullName,
        status: patient.status,
        gestationalAge: patient.gestationalAge,
        facility: patient.facility,
      },
      latest,
      draft,
      history: completed,
    })
  })
}
