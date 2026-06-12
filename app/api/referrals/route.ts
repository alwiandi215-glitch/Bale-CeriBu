import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, created, handle, requirePermission, parsePagination } from "@/lib/api"
import { referralSchema } from "@/lib/validation"
import { writeAudit, writeActivity, requestMeta } from "@/lib/audit"

export const runtime = "nodejs"

// GET /api/referrals — Modul 9: daftar rujukan.
export function GET(req: NextRequest) {
  return handle(async () => {
    await requirePermission("screening:read")
    const { skip, take, page, pageSize } = parsePagination(req.url)
    const { searchParams } = new URL(req.url)
    const where: Record<string, unknown> = {}
    if (searchParams.get("status")) where.status = searchParams.get("status")
    const [items, total] = await Promise.all([
      prisma.referral.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: { patient: { select: { fullName: true, mrn: true } }, destinationFacility: { select: { name: true } } } }),
      prisma.referral.count({ where }),
    ])
    return ok({ items, total, page, pageSize })
  })
}

export function POST(req: NextRequest) {
  return handle(async () => {
    const auth = await requirePermission("referral:write")
    const input = referralSchema.parse(await req.json())
    const referral = await prisma.referral.create({
      data: { ...input, createdById: auth.sub, originFacilityId: auth.facilityId ?? undefined, status: "SENT", sentAt: new Date() },
    })
    await writeAudit({ userId: auth.sub, action: "CREATE", entity: "Referral", entityId: referral.id, ...requestMeta(req) })
    await writeActivity({ userId: auth.sub, type: "REFERRAL_SENT", message: `Rujukan dikirim untuk pasien ${input.patientId}`, meta: { referralId: referral.id } })
    return created(referral)
  })
}
