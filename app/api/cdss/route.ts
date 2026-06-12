import { NextRequest } from "next/server"
import { ok, handle, requirePermission } from "@/lib/api"
import { screeningSubmitSchema } from "@/lib/validation"
import { evaluateEpds } from "@/lib/epds"
import { runCdss } from "@/lib/cdss"

export const runtime = "nodejs"

// POST /api/cdss — Modul 6: evaluasi tanpa menyimpan (preview rekomendasi).
export function POST(req: NextRequest) {
  return handle(async () => {
    await requirePermission("cdss:read")
    const { answers } = screeningSubmitSchema.pick({ answers: true }).parse(await req.json())
    const result = evaluateEpds(answers)
    return ok({ result, cdss: runCdss(result) })
  })
}
