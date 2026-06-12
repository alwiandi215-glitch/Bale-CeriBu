import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, handle, requirePermission } from "@/lib/api"
import { patientSchema } from "@/lib/validation"
import { writeAudit, requestMeta } from "@/lib/audit"

export const runtime = "nodejs"
type Params = { params: Promise<{ id: string }> }

// GET /api/patients/:id — detail + riwayat skrining.
export function GET(_req: NextRequest, { params }: Params) {
  return handle(async () => {
    await requirePermission("patient:read")
    const { id } = await params
    const patient = await prisma.patient.findUniqueOrThrow({
      where: { id },
      include: {
        screenings: { orderBy: { startedAt: "desc" }, take: 20 },
        interventions: { orderBy: { createdAt: "desc" }, take: 20 },
        referrals: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    })
    return ok(patient)
  })
}

export function PUT(req: NextRequest, { params }: Params) {
  return handle(async () => {
    const auth = await requirePermission("patient:write")
    const { id } = await params
    const input = patientSchema.partial().parse(await req.json())
    const patient = await prisma.patient.update({ where: { id }, data: input })
    await writeAudit({ userId: auth.sub, action: "UPDATE", entity: "Patient", entityId: id, ...requestMeta(req) })
    return ok(patient)
  })
}
