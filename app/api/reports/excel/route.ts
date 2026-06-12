import { NextRequest } from "next/server"
import ExcelJS from "exceljs"
import { prisma } from "@/lib/prisma"
import { fail, getAuth, HttpError } from "@/lib/api"
import { can } from "@/lib/rbac"
import { riskLabel } from "@/lib/epds"
import { writeAudit, requestMeta } from "@/lib/audit"

export const runtime = "nodejs"

// GET /api/reports/excel — Modul 12: ekspor rekap skrining ke Excel.
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuth()
    if (!can(auth.role, "report:export")) throw new HttpError(403, "FORBIDDEN", "Tidak diizinkan mengekspor")
    const aggregateOnly = can(auth.role, "analytics:aggregate_only")

    const screenings = await prisma.screening.findMany({
      where: { status: { not: "DRAFT" } },
      orderBy: { completedAt: "desc" },
      take: 5000,
      include: { patient: { select: { fullName: true, mrn: true, city: true, district: true } } },
    })

    const wb = new ExcelJS.Workbook()
    wb.creator = "BALE CERIBU"
    const ws = wb.addWorksheet("Rekap Skrining EPDS")
    ws.columns = aggregateOnly
      ? [
          { header: "Tanggal", key: "date", width: 20 },
          { header: "Wilayah", key: "area", width: 24 },
          { header: "Total Skor", key: "score", width: 12 },
          { header: "Risiko", key: "risk", width: 16 },
          { header: "HIGH ALERT", key: "alert", width: 12 },
        ]
      : [
          { header: "Tanggal", key: "date", width: 20 },
          { header: "No. RM", key: "mrn", width: 16 },
          { header: "Nama Pasien", key: "name", width: 28 },
          { header: "Wilayah", key: "area", width: 24 },
          { header: "Total Skor", key: "score", width: 12 },
          { header: "Risiko", key: "risk", width: 16 },
          { header: "HIGH ALERT", key: "alert", width: 12 },
        ]
    ws.getRow(1).font = { bold: true }

    for (const s of screenings) {
      const area = [s.patient.district, s.patient.city].filter(Boolean).join(", ")
      ws.addRow(
        aggregateOnly
          ? { date: s.completedAt?.toISOString().slice(0, 10), area, score: s.totalScore, risk: s.riskLevel ? riskLabel(s.riskLevel) : "-", alert: s.highAlert ? "YA" : "" }
          : { date: s.completedAt?.toISOString().slice(0, 10), mrn: s.patient.mrn, name: s.patient.fullName, area, score: s.totalScore, risk: s.riskLevel ? riskLabel(s.riskLevel) : "-", alert: s.highAlert ? "YA" : "" },
      )
    }

    const buffer = await wb.xlsx.writeBuffer()
    await writeAudit({ userId: auth.sub, action: "EXPORT", entity: "Report", entityId: "excel", after: { rows: screenings.length, aggregateOnly }, ...requestMeta(req) })
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="rekap-skrining-epds.xlsx"`,
      },
    })
  } catch (err) {
    if (err instanceof HttpError) return fail(err.status, { code: err.code, message: err.message })
    console.error(err)
    return fail(500, { code: "INTERNAL", message: "Gagal membuat Excel" })
  }
}
