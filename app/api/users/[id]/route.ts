import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, handle, requirePermission } from "@/lib/api"
import { updateUserSchema } from "@/lib/validation"
import { hashPassword } from "@/lib/auth"
import { writeAudit, requestMeta } from "@/lib/audit"

export const runtime = "nodejs"
type Params = { params: Promise<{ id: string }> }

export function GET(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    await requirePermission("user:manage")
    const { id } = await params
    const user = await prisma.user.findUniqueOrThrow({
      where: { id },
      select: { id: true, email: true, fullName: true, role: true, status: true, phone: true, facilityId: true, lastLoginAt: true, createdAt: true },
    })
    return ok(user)
  })
}

export function PUT(req: NextRequest, { params }: Params) {
  return handle(async () => {
    const auth = await requirePermission("user:manage")
    const { id } = await params
    const input = updateUserSchema.parse(await req.json())
    const data: Record<string, unknown> = { ...input }
    delete data.password
    if (input.password) data.passwordHash = await hashPassword(input.password)
    const user = await prisma.user.update({
      where: { id }, data,
      select: { id: true, email: true, fullName: true, role: true, status: true },
    })
    await writeAudit({ userId: auth.sub, action: "UPDATE", entity: "User", entityId: id, after: user, ...requestMeta(req) })
    return ok(user)
  })
}

// Soft-deactivate (tidak menghapus demi integritas audit/relasi).
export function DELETE(req: NextRequest, { params }: Params) {
  return handle(async () => {
    const auth = await requirePermission("user:manage")
    const { id } = await params
    const user = await prisma.user.update({ where: { id }, data: { status: "INACTIVE" }, select: { id: true, status: true } })
    await prisma.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } })
    await writeAudit({ userId: auth.sub, action: "DEACTIVATE", entity: "User", entityId: id, ...requestMeta(req) })
    return ok(user)
  })
}
