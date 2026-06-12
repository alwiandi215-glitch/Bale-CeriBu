import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, handle } from "@/lib/api"
import { readSessionToken, verifyToken, clearSessionCookie } from "@/lib/auth"
import { writeAudit, requestMeta } from "@/lib/audit"

export const runtime = "nodejs"

// POST /api/auth/logout — revoke sesi aktif.
export function POST(req: NextRequest) {
  return handle(async () => {
    const token = await readSessionToken()
    if (token) {
      const payload = await verifyToken(token)
      if (payload) {
        await prisma.session.updateMany({
          where: { tokenId: payload.jti, revokedAt: null },
          data: { revokedAt: new Date() },
        })
        await writeAudit({ userId: payload.sub, action: "LOGOUT", entity: "User", entityId: payload.sub, ...requestMeta(req) })
      }
    }
    await clearSessionCookie()
    return ok({ loggedOut: true })
  })
}
