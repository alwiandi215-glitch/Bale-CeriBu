import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, handle, requirePermission, parsePagination } from "@/lib/api"

export const runtime = "nodejs"

// GET /api/audit — Modul 13: audit log + activity log (type=activity).
export function GET(req: NextRequest) {
  return handle(async () => {
    await requirePermission("audit:read")
    const { skip, take, page, pageSize } = parsePagination(req.url)
    const { searchParams } = new URL(req.url)
    if (searchParams.get("type") === "activity") {
      const [items, total] = await Promise.all([
        prisma.activityLog.findMany({ skip, take, orderBy: { createdAt: "desc" }, include: { user: { select: { fullName: true } } } }),
        prisma.activityLog.count(),
      ])
      return ok({ items, total, page, pageSize, kind: "activity" })
    }
    const where: Record<string, unknown> = {}
    if (searchParams.get("entity")) where.entity = searchParams.get("entity")
    if (searchParams.get("action")) where.action = searchParams.get("action")
    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: { user: { select: { fullName: true } } } }),
      prisma.auditLog.count({ where }),
    ])
    return ok({ items, total, page, pageSize, kind: "audit" })
  })
}
