import { handle, ok, requirePermission } from "@/lib/api"
import { getAnalyticsSummary } from "@/lib/analytics"

export const runtime = "nodejs"

// GET /api/analytics — Modul 11: ringkasan KPI near-real-time.
// Petugas dinas hanya menerima data agregat (tanpa identitas pasien).
export function GET() {
  return handle(async () => {
    const auth = await requirePermission("analytics:read")
    const scope = auth.role === "PETUGAS_DINAS" || auth.role === "SUPER_ADMIN" ? null : auth.facilityId
    const summary = await getAnalyticsSummary(scope)
    return ok(summary)
  })
}
