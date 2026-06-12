// ============================================================
// MODUL 15 — Klien integrasi BPJS Kesehatan (VClaim/PCare).
// Signature HMAC-SHA256 + timestamp sesuai standar bridging BPJS.
// Mode "mock" mengembalikan respons simulasi.
// ============================================================
import crypto from "node:crypto"
import { env } from "../env"
import { prisma } from "../prisma"

function signature(): { headers: Record<string, string>; timestamp: string } {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const message = `${env.BPJS_CONS_ID}&${timestamp}`
  const hmac = crypto
    .createHmac("sha256", env.BPJS_SECRET_KEY ?? "")
    .update(message)
    .digest("base64")
  return {
    timestamp,
    headers: {
      "X-cons-id": env.BPJS_CONS_ID ?? "",
      "X-timestamp": timestamp,
      "X-signature": hmac,
      "user_key": env.BPJS_USER_KEY ?? "",
      "Content-Type": "application/json; charset=utf-8",
    },
  }
}

async function log(operation: string, status: "SUCCESS" | "FAILED", req: unknown, res: unknown, durationMs?: number) {
  await prisma.integrationLog.create({
    data: { provider: "BPJS", operation, status, request: (req ?? undefined) as never, response: (res ?? undefined) as never, durationMs: durationMs ?? null },
  })
}

export async function checkPeserta(bpjsNumber: string): Promise<{
  ok: boolean
  active: boolean
  name?: string
  mocked: boolean
}> {
  const started = Date.now()
  if (env.INTEGRATION_MODE === "mock") {
    await log("CHECK_PESERTA", "SUCCESS", { bpjsNumber }, { active: true, mocked: true }, Date.now() - started)
    return { ok: true, active: true, name: "Peserta Simulasi", mocked: true }
  }
  try {
    const { headers } = signature()
    const res = await fetch(`${env.BPJS_BASE_URL}/vclaim-rest/Peserta/nokartu/${bpjsNumber}`, { headers })
    const json = await res.json()
    await log("CHECK_PESERTA", res.ok ? "SUCCESS" : "FAILED", { bpjsNumber }, json, Date.now() - started)
    return { ok: res.ok, active: res.ok, mocked: false }
  } catch (e) {
    await log("CHECK_PESERTA", "FAILED", { bpjsNumber }, { error: String(e) }, Date.now() - started)
    return { ok: false, active: false, mocked: false }
  }
}
