import { prisma } from "@/lib/prisma"
import { ok, handle, getAuth } from "@/lib/api"
import { ROLE_PERMISSIONS } from "@/lib/rbac"

export const runtime = "nodejs"

// GET /api/auth/me — profil & permission user terautentikasi.
export function GET() {
  return handle(async () => {
    const auth = await getAuth()
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: auth.sub },
      select: {
        id: true, email: true, fullName: true, role: true, status: true,
        phone: true, facilityId: true, facility: { select: { id: true, name: true } },
      },
    })
    return ok({ user, permissions: ROLE_PERMISSIONS[user.role] })
  })
}
