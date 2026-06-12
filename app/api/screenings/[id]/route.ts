import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, handle, requirePermission } from "@/lib/api"
import { writeAudit, requestMeta } from "@/lib/audit"

export const runtime = "nodejs"
type Params = { params: Promise<{ id: string }> }

export function GET(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    await requirePermission("screening:read")
    const { id } = await params
    const screening = await prisma.screening.findUniqueOrThrow({
      where: { id },
      include: {
        patient: { select: { id: true, fullName: true, mrn: true, phone: true } },
        screenedBy: { select: { id: true, fullName: true } },
        interventions: true,
        referrals: true,
      },
    })
    return ok(screening)
  })
}

// PATCH /api/screenings/:id — tinjauan klinisi (review).
export function PATCH(req: NextRequest, { params }: Params) {
  return handle(async () => {
    const auth = await requirePermission("screening:review")
    const { id } = await params
    const screening = await prisma.screening.update({
      where: { id },
      data: { status: "REVIEWED", reviewedById: auth.sub, reviewedAt: new Date() },
    })
    await writeAudit({ userId: auth.sub, action: "REVIEW", entity: "Screening", entityId: id, ...requestMeta(req) })
    return ok(screening)
  })
}
