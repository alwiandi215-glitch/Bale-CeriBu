// ============================================================
// MODUL 15 — Klien WhatsApp Gateway (Meta Cloud API / kompatibel).
// Dipakai oleh modul reminder & notifikasi HIGH ALERT.
// Mode "mock" mensimulasikan pengiriman tanpa memanggil API.
// ============================================================
import { env } from "../env"
import { prisma } from "../prisma"

function normalizePhone(phone: string): string {
  // Normalisasi nomor Indonesia ke format E.164 (62...).
  let p = phone.replace(/[^0-9]/g, "")
  if (p.startsWith("0")) p = `62${p.slice(1)}`
  if (!p.startsWith("62")) p = `62${p}`
  return p
}

async function log(operation: string, status: "SUCCESS" | "FAILED", req: unknown, res: unknown, refId?: string, durationMs?: number) {
  await prisma.integrationLog.create({
    data: {
      provider: "WHATSAPP",
      operation,
      status,
      request: (req ?? undefined) as never,
      response: (res ?? undefined) as never,
      refType: refId ? "Reminder" : null,
      refId: refId ?? null,
      durationMs: durationMs ?? null,
    },
  })
}

export async function sendWhatsApp(input: {
  phone: string
  message: string
  reminderId?: string
}): Promise<{ ok: boolean; externalId?: string; mocked: boolean; error?: string }> {
  const started = Date.now()
  const to = normalizePhone(input.phone)
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: input.message },
  }
  if (env.INTEGRATION_MODE === "mock") {
    const externalId = `wamid.mock-${Math.random().toString(36).slice(2, 12)}`
    await log("SEND_MESSAGE", "SUCCESS", payload, { externalId, mocked: true }, input.reminderId, Date.now() - started)
    return { ok: true, externalId, mocked: true }
  }
  try {
    const res = await fetch(`${env.WHATSAPP_BASE_URL}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const json = (await res.json()) as { messages?: Array<{ id: string }>; error?: unknown }
    await log("SEND_MESSAGE", res.ok ? "SUCCESS" : "FAILED", payload, json, input.reminderId, Date.now() - started)
    return { ok: res.ok, externalId: json.messages?.[0]?.id, mocked: false, error: res.ok ? undefined : JSON.stringify(json.error) }
  } catch (e) {
    await log("SEND_MESSAGE", "FAILED", payload, { error: String(e) }, input.reminderId, Date.now() - started)
    return { ok: false, mocked: false, error: String(e) }
  }
}
