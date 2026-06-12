import { prisma } from "@/lib/prisma"
import { ok, handle, requirePermission, HttpError } from "@/lib/api"

export const runtime = "nodejs"

// GET /api/me/notifications — Portal Ibu: notifikasi & pengingat untuk dirinya.
export function GET() {
  return handle(async () => {
    const auth = await requirePermission("self:notification")
    const patient = await prisma.patient.findUnique({ where: { userId: auth.sub }, select: { id: true } })
    if (!patient) {
      throw new HttpError(404, "NO_PATIENT", "Akun Anda belum tertaut ke data pasien.")
    }
    const items = await prisma.reminder.findMany({
      where: { patientId: patient.id },
      orderBy: { scheduledAt: "desc" },
      take: 50,
      select: { id: true, title: true, message: true, channel: true, status: true, scheduledAt: true, sentAt: true },
    })
    return ok({ items })
  })
}
