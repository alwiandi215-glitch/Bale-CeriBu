import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, created, handle, requirePermission, getAuth } from "@/lib/api"

export const runtime = "nodejs"

// GET /api/education — Modul 7: daftar materi edukasi (filter slug/risk/category).
export function GET(req: NextRequest) {
  return handle(async () => {
    await getAuth()
    const { searchParams } = new URL(req.url)
    const where: Record<string, unknown> = { published: true }
    const slugs = searchParams.get("slugs")
    if (slugs) where.slug = { in: slugs.split(",") }
    if (searchParams.get("risk")) where.riskTarget = searchParams.get("risk")
    if (searchParams.get("category")) where.category = searchParams.get("category")
    const items = await prisma.educationMaterial.findMany({ where, orderBy: { title: "asc" } })
    return ok({ items })
  })
}

// POST /api/education — buat/kelola materi (admin).
export function POST(req: NextRequest) {
  return handle(async () => {
    await requirePermission("education:manage")
    const body = await req.json()
    const material = await prisma.educationMaterial.create({ data: body })
    return created(material)
  })
}
