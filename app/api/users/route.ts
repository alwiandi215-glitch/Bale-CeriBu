import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, created, handle, requirePermission, parsePagination } from "@/lib/api"
import { createUserSchema } from "@/lib/validation"
import { hashPassword } from "@/lib/auth"
import { writeAudit, requestMeta } from "@/lib/audit"

export const runtime = "nodejs"

// GET /api/users — Modul 2 (daftar pengguna).
export function GET(req: NextRequest) {
  return handle(async () => {
    await requirePermission("user:manage")
    const { skip, take, q, page, pageSize } = parsePagination(req.url)
    const where = q
      ? { OR: [{ fullName: { contains: q, mode: "insensitive" as const } }, { email: { contains: q, mode: "insensitive" as const } }] }
      : {}
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take, orderBy: { createdAt: "desc" },
        select: { id: true, email: true, fullName: true, role: true, status: true, phone: true, facilityId: true, lastLoginAt: true, createdAt: true },
      }),
      prisma.user.count({ where }),
    ])
    return ok({ items, total, page, pageSize })
  })
}

// POST /api/users — buat pengguna baru.
export function POST(req: NextRequest) {
  return handle(async () => {
    const auth = await requirePermission("user:manage")
    const input = createUserSchema.parse(await req.json())
    const passwordHash = await hashPassword(input.password)
    const user = await prisma.user.create({
      data: {
        email: input.email, fullName: input.fullName, passwordHash, role: input.role,
        phone: input.phone, facilityId: input.facilityId, mustChangePassword: true,
      },
      select: { id: true, email: true, fullName: true, role: true, status: true },
    })
    await writeAudit({ userId: auth.sub, action: "CREATE", entity: "User", entityId: user.id, after: user, ...requestMeta(req) })
    return created(user)
  })
}
