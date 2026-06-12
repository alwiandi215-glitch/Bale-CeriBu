import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, created, handle, requirePermission, parsePagination } from "@/lib/api"
import { patientSchema } from "@/lib/validation"
import { writeAudit, requestMeta } from "@/lib/audit"

export const runtime = "nodejs"

// GET /api/patients — Modul 3 (daftar/cari pasien).
export function GET(req: NextRequest) {
  return handle(async () => {
    const auth = await requirePermission("patient:read")
    const { skip, take, q, page, pageSize } = parsePagination(req.url)
    const where: Record<string, unknown> = {}
    // Kader/bidan/dokter dibatasi ke faskes-nya; super admin/dinas lihat semua.
    if (auth.facilityId && ["BIDAN", "KADER", "DOKTER", "ADMIN_FASKES"].includes(auth.role)) {
      where.facilityId = auth.facilityId
    }
    if (q) where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { mrn: { contains: q, mode: "insensitive" } },
    ]
    const [items, total] = await Promise.all([
      prisma.patient.findMany({ where, skip, take, orderBy: { updatedAt: "desc" } }),
      prisma.patient.count({ where }),
    ])
    return ok({ items, total, page, pageSize })
  })
}

// POST /api/patients — daftar pasien baru.
export function POST(req: NextRequest) {
  return handle(async () => {
    const auth = await requirePermission("patient:write")
    const input = patientSchema.parse(await req.json())
    const patient = await prisma.patient.create({
      data: {
        ...input,
        facilityId: input.facilityId ?? auth.facilityId ?? undefined,
        consentAt: input.consentGiven ? new Date() : undefined,
      },
    })
    await writeAudit({ userId: auth.sub, action: "CREATE", entity: "Patient", entityId: patient.id, after: { mrn: patient.mrn }, ...requestMeta(req) })
    return created(patient)
  })
}
