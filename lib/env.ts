// Validasi & akses environment variables terpusat.
// Bersifat tahan-banting: nilai env yang tidak valid dibuang agar default dipakai,
// sehingga proses build ("Collecting page data") tidak pernah crash.
import { z } from "zod"

const schema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  DIRECT_URL: z.string().optional(),
  JWT_SECRET: z.string().min(16).default("dev-secret-change-me-please-32chars"),
  JWT_EXPIRES_IN: z.string().default("8h"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(8).max(15).default(12),
  NEXT_PUBLIC_APP_NAME: z.string().default("BALE CERIBU"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  INTEGRATION_MODE: z.enum(["mock", "live"]).default("mock"),

  SATUSEHAT_BASE_URL: z.string().optional(),
  SATUSEHAT_AUTH_URL: z.string().optional(),
  SATUSEHAT_CLIENT_ID: z.string().optional(),
  SATUSEHAT_CLIENT_SECRET: z.string().optional(),
  SATUSEHAT_ORG_ID: z.string().optional(),

  BPJS_BASE_URL: z.string().optional(),
  BPJS_CONS_ID: z.string().optional(),
  BPJS_SECRET_KEY: z.string().optional(),
  BPJS_USER_KEY: z.string().optional(),

  WHATSAPP_BASE_URL: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
})

// Salin process.env lalu buang nilai yang jelas tidak valid agar default berlaku.
const raw: Record<string, string | undefined> = { ...process.env }

if (!raw.JWT_SECRET || raw.JWT_SECRET.trim().length < 16) delete raw.JWT_SECRET
if (raw.BCRYPT_ROUNDS === undefined || !Number.isFinite(Number(raw.BCRYPT_ROUNDS))) delete raw.BCRYPT_ROUNDS
if (raw.INTEGRATION_MODE !== "mock" && raw.INTEGRATION_MODE !== "live") delete raw.INTEGRATION_MODE

const parsed = schema.safeParse(raw)

if (!parsed.success) {
  // Jangan hentikan build/runtime; cukup peringatkan lalu pakai default penuh.
  console.warn("[env] Validasi environment gagal, memakai nilai default:", parsed.error.flatten().fieldErrors)
}

export const env = parsed.success ? parsed.data : schema.parse({})
export type Env = z.infer<typeof schema>
