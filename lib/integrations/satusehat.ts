// ============================================================
// MODUL 15 — Klien integrasi SATUSEHAT (Kemenkes, FHIR R4).
// Mode "mock" mengembalikan respons simulasi tanpa memanggil API.
// Mode "live" memanggil endpoint nyata memakai kredensial OAuth2.
// ============================================================
import { env } from "../env"
import { prisma } from "../prisma"

type TokenCache = { token: string; expiresAt: number }
let tokenCache: TokenCache | null = null

async function getToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) return tokenCache.token
  const res = await fetch(`${env.SATUSEHAT_AUTH_URL}/accesstoken?grant_type=client_credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.SATUSEHAT_CLIENT_ID ?? "",
      client_secret: env.SATUSEHAT_CLIENT_SECRET ?? "",
    }),
  })
  if (!res.ok) throw new Error(`SATUSEHAT auth gagal: ${res.status}`)
  const json = (await res.json()) as { access_token: string; expires_in: string }
  tokenCache = {
    token: json.access_token,
    expiresAt: Date.now() + Number(json.expires_in ?? 3600) * 1000,
  }
  return tokenCache.token
}

async function log(operation: string, status: "SUCCESS" | "FAILED", req: unknown, res: unknown, refId?: string, durationMs?: number) {
  await prisma.integrationLog.create({
    data: {
      provider: "SATUSEHAT",
      operation,
      status,
      request: (req ?? undefined) as never,
      response: (res ?? undefined) as never,
      refType: refId ? "Screening" : null,
      refId: refId ?? null,
      durationMs: durationMs ?? null,
    },
  })
}

// Bentuk FHIR Observation untuk skor EPDS (LOINC 99046-5 — contoh pemetaan).
export function buildEpdsObservation(input: {
  patientSatusehatId: string
  totalScore: number
  effectiveDateTime: string
}) {
  return {
    resourceType: "Observation",
    status: "final",
    code: {
      coding: [{ system: "http://loinc.org", code: "99046-5", display: "Edinburgh Postnatal Depression Scale" }],
    },
    subject: { reference: `Patient/${input.patientSatusehatId}` },
    effectiveDateTime: input.effectiveDateTime,
    performer: [{ reference: `Organization/${env.SATUSEHAT_ORG_ID}` }],
    valueQuantity: { value: input.totalScore, unit: "score", system: "http://unitsofmeasure.org", code: "{score}" },
  }
}

export async function pushEpdsObservation(input: {
  patientSatusehatId: string
  totalScore: number
  effectiveDateTime: string
  screeningId?: string
}): Promise<{ ok: boolean; id?: string; mocked: boolean }> {
  const started = Date.now()
  const payload = buildEpdsObservation(input)
  if (env.INTEGRATION_MODE === "mock") {
    const fakeId = `obs-mock-${Math.random().toString(36).slice(2, 10)}`
    await log("PUSH_OBSERVATION", "SUCCESS", payload, { id: fakeId, mocked: true }, input.screeningId, Date.now() - started)
    return { ok: true, id: fakeId, mocked: true }
  }
  try {
    const token = await getToken()
    const res = await fetch(`${env.SATUSEHAT_BASE_URL}/fhir-r4/v1/Observation`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    await log("PUSH_OBSERVATION", res.ok ? "SUCCESS" : "FAILED", payload, json, input.screeningId, Date.now() - started)
    return { ok: res.ok, id: (json as { id?: string }).id, mocked: false }
  } catch (e) {
    await log("PUSH_OBSERVATION", "FAILED", payload, { error: String(e) }, input.screeningId, Date.now() - started)
    return { ok: false, mocked: false }
  }
}
