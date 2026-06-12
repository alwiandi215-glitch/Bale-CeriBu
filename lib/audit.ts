// ============================================================
// MODUL 13 — Audit log & activity log helper.
// ============================================================
import { prisma } from "./prisma"

export async function writeAudit(input: {
  userId?: string | null
  action: string
  entity: string
  entityId?: string | null
  before?: unknown
  after?: unknown
  ipAddress?: string | null
  userAgent?: string | null
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        before: (input.before ?? undefined) as never,
        after: (input.after ?? undefined) as never,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    })
  } catch (e) {
    // Audit tidak boleh menggagalkan transaksi bisnis utama.
    console.error("[AUDIT_FAIL]", e)
  }
}

export async function writeActivity(input: {
  userId?: string | null
  type: string
  message: string
  meta?: unknown
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: input.userId ?? null,
        type: input.type,
        message: input.message,
        meta: (input.meta ?? undefined) as never,
      },
    })
  } catch (e) {
    console.error("[ACTIVITY_FAIL]", e)
  }
}

// Ekstrak metadata request untuk audit.
export function requestMeta(req: Request) {
  return {
    ipAddress:
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      null,
    userAgent: req.headers.get("user-agent") ?? null,
  }
}
