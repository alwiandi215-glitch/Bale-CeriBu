import { NextRequest } from "next/server"
import { ok, fail } from "@/lib/api"
import { processDueReminders } from "@/lib/reminder-service"
import { env } from "@/lib/env"

export const runtime = "nodejs"

// POST /api/cron/reminders — Modul 10: diproses oleh Netlify Scheduled Function.
// Dilindungi header rahasia (CRON_SECRET) agar tidak bisa dipicu publik.
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret")
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return fail(401, { code: "UNAUTHORIZED", message: "Cron secret tidak valid" })
  }
  const result = await processDueReminders()
  return ok({ ...result, mode: env.INTEGRATION_MODE, ranAt: new Date().toISOString() })
}
