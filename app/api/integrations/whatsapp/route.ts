import { NextRequest } from "next/server"
import { ok, handle, requirePermission } from "@/lib/api"
import { sendWhatsApp } from "@/lib/integrations/whatsapp"

export const runtime = "nodejs"

// POST /api/integrations/whatsapp — Modul 15: kirim pesan uji/manual via gateway.
// Body: { phone, message }
export function POST(req: NextRequest) {
  return handle(async () => {
    await requirePermission("integration:manage")
    const { phone, message } = (await req.json()) as { phone: string; message: string }
    const res = await sendWhatsApp({ phone, message })
    return ok(res)
  })
}
