import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, handle, requirePermission } from "@/lib/api"
import { writeAudit, writeActivity, requestMeta } from "@/lib/audit"

export const runtime = "nodejs"
type Params = { params: Promise<{ id: string }> }

// PATCH /api/referrals/:id — transisi status (closed-loop) + feedback.
export function PATCH(req: NextRequest, { params }: Params) {
  return handle(async () => {
    const auth = await requirePermission("referral:write")
    const { id } = await params
    const body = await req.json() as { status?: string; feedback?: string }
    const data: Record<string, unknown> = {}
    if (body.status) data.status = body.status
    if (body.feedback) data.feedback = body.feedback
    if (body.status === "ACCEPTED") data.acceptedAt = new Date()
    if (body.status === "CLOSED") data.closedAt = new Date()
    const referral = await prisma.referral.update({ where: { id }, data })
    await writeAudit({ userId: auth.sub, action: "UPDATE", entity: "Referral", entityId: id, after: { status: body.status }, ...requestMeta(req) })
    if (body.status === "CLOSED") await writeActivity({ userId: auth.sub, type: "REFERRAL_CLOSED", message: `Rujukan ditutup dengan feedback`, meta: { referralId: id } })
    return ok(referral)
  })
}
