import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, created, handle, requirePermission, parsePagination } from "@/lib/api"
import { reminderSchema } from "@/lib/validation"
import { writeAudit, requestMeta } from "@/lib/audit"

export const runtime = "nodejs"

// GET /api/reminders — Modul 10: daftar reminder terjadwal.
export function GET(req: NextRequest) {
  return handle(async () => {
    await requirePermission("reminder:write")
    const { skip, take, page, pageSize } = parsePagination(req.url)
    const { searchParams } = new URL(req.url)
    const where: Record<string, unknown> = {}
    if (searchParams.get("status")) where.status = searchParams.get("status")
    const [items, total] = await Promise.all([
      prisma.reminder.findMany({ where, skip, take, orderBy: { scheduledAt: "asc" }, include: { patient: { select: { fullName: true } } } }),
      prisma.reminder.count({ where }),
    ])
    return ok({ items, total, page, pageSize })
  })
}

export function POST(req: NextRequest) {
  return handle(async () => {
    const auth = await requirePermission("reminder:write")
    const input = reminderSchema.parse(await req.json())
    const reminder = await prisma.reminder.create({ data: input })
    await writeAudit({ userId: auth.sub, action: "CREATE", entity: "Reminder", entityId: reminder.id, ...requestMeta(req) })
    return created(reminder)
  })
}
