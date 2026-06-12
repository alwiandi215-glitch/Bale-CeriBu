import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, handle, requirePermission, getAuth } from "@/lib/api"
import { settingSchema } from "@/lib/validation"
import { writeAudit, requestMeta } from "@/lib/audit"

export const runtime = "nodejs"

// GET /api/settings — Modul 14: baca pengaturan sistem.
export function GET(req: NextRequest) {
  return handle(async () => {
    await getAuth()
    const { searchParams } = new URL(req.url)
    const where = searchParams.get("category") ? { category: searchParams.get("category")! } : {}
    const items = await prisma.setting.findMany({ where, orderBy: { key: "asc" } })
    return ok({ items })
  })
}

// PUT /api/settings — upsert pengaturan (admin).
export function PUT(req: NextRequest) {
  return handle(async () => {
    const auth = await requirePermission("settings:manage")
    const input = settingSchema.parse(await req.json())
    const setting = await prisma.setting.upsert({
      where: { key: input.key },
      create: { key: input.key, value: input.value as never, category: input.category },
      update: { value: input.value as never, category: input.category },
    })
    await writeAudit({ userId: auth.sub, action: "UPDATE", entity: "Setting", entityId: input.key, after: input.value, ...requestMeta(req) })
    return ok(setting)
  })
}
