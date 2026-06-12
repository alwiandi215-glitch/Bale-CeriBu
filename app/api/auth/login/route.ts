import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, fail, handle, HttpError } from "@/lib/api"
import { loginSchema } from "@/lib/validation"
import {
  verifyPassword, signToken, setSessionCookie,
  MAX_FAILED_LOGINS, LOCK_MINUTES,
} from "@/lib/auth"
import { writeAudit, writeActivity, requestMeta } from "@/lib/audit"
import { roleLabel } from "@/lib/rbac"

export const runtime = "nodejs"

// POST /api/auth/login — Modul 1 (autentikasi + lockout brute-force).
export function POST(req: NextRequest) {
  return handle(async () => {
    const body = await req.json()
    const { email, password } = loginSchema.parse(body)
    const meta = requestMeta(req)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new HttpError(401, "INVALID_CREDENTIALS", "Email atau kata sandi salah")

    if (user.status === "INACTIVE")
      throw new HttpError(403, "INACTIVE", "Akun nonaktif. Hubungi administrator.")
    if (user.lockedUntil && user.lockedUntil > new Date())
      throw new HttpError(423, "LOCKED", "Akun terkunci sementara karena percobaan login gagal. Coba lagi nanti.")

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      const failed = user.failedLoginCount + 1
      const lock = failed >= MAX_FAILED_LOGINS
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: lock ? 0 : failed,
          lockedUntil: lock ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null,
          status: lock ? "LOCKED" : user.status,
        },
      })
      await writeAudit({ userId: user.id, action: "LOGIN_FAILED", entity: "User", entityId: user.id, ...meta })
      throw new HttpError(401, "INVALID_CREDENTIALS", "Email atau kata sandi salah")
    }

    const { token, jti, expiresAt } = await signToken({
      sub: user.id, role: user.role, facilityId: user.facilityId, email: user.email,
    })
    await prisma.session.create({
      data: { userId: user.id, tokenId: jti, expiresAt, userAgent: meta.userAgent, ipAddress: meta.ipAddress },
    })
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date(), status: "ACTIVE" },
    })
    await setSessionCookie(token, expiresAt)
    await writeAudit({ userId: user.id, action: "LOGIN", entity: "User", entityId: user.id, ...meta })
    await writeActivity({ userId: user.id, type: "LOGIN", message: `${user.fullName} (${roleLabel(user.role)}) masuk` })

    return ok({
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, facilityId: user.facilityId },
      mustChangePassword: user.mustChangePassword,
    })
  })
}

export function GET() {
  return fail(405, { code: "METHOD_NOT_ALLOWED", message: "Gunakan POST" })
}
