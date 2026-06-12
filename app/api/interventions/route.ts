import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, created, handle, requirePermission, parsePagination } from "@/lib/api"
import { interventionSchema } from "@/lib/validation"
import { writeAudit, requestMeta } from "@/lib/audit"

export const runtime = "nodejs"

// GET /api/interventions — Modul 8: daftar intervensi/tindak lanjut.
export function GET(req: NextRequest) {
  return handle(async () => {
    await requirePermission("screening:read")
    const { skip, take, page, pageSize } = parsePagination(req.url)
    const { searchParams } = new URL(req.url)
    const where: Record<string, unknown> = {}
    if (searchParams.get("patientId")) where.patientId = searchParams.get("patientId")
    if (searchParams.get("status")) where.status = searchParams.get("status")
    const [items, total] = await Promise.all([
      prisma.intervention.findMany({ where, skip, take, orderBy: { dueDate: "asc" }, include: { patient: { select: { fullName: true, mrn: true } } } }),
      prisma.intervention.count({ where }),
    ])
    return ok({ items, total, page, pageSize })
  })
}

export function POST(req: NextRequest) {
  return handle(async () => {
    const auth = await requirePermission("intervention:write")
    const input = interventionSchema.parse(await req.json())
    const intervention = await prisma.intervention.create({ data: { ...input, assignedToId: input.assignedToId ?? auth.sub } })
    await writeAudit({ userId: auth.sub, action: "CREATE", entity: "Intervention", entityId: intervention.id, ...requestMeta(req) })
    return created(intervention)
  })
}

// PATCH /api/interventions?id=... — update status/outcome.
export function PATCH(req: NextRequest) {
  return handle(async () => {
    const auth = await requirePermission("intervention:write")
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return ok({ error: "id wajib" })
    const body = await req.json()
    const data: Record<string, unknown> = { status: body.status, outcome: body.outcome }
    if (body.status === "COMPLETED") data.completedAt = new Date()
    const intervention = await prisma.intervention.update({ where: { id }, data })
    await writeAudit({ userId: auth.sub, action: "UPDATE", entity: "Intervention", entityId: id, ...requestMeta(req) })
    return ok(intervention)
  })
}
