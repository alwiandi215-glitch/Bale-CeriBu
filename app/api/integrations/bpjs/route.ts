import { NextRequest } from "next/server"
import { ok, handle, requirePermission } from "@/lib/api"
import { checkPeserta } from "@/lib/integrations/bpjs"

export const runtime = "nodejs"

// GET /api/integrations/bpjs?nokartu=... — Modul 15: cek keaktifan peserta BPJS.
export function GET(req: NextRequest) {
  return handle(async () => {
    await requirePermission("integration:manage")
    const { searchParams } = new URL(req.url)
    const nokartu = searchParams.get("nokartu") ?? ""
    const res = await checkPeserta(nokartu)
    return ok(res)
  })
}
