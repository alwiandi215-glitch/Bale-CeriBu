import { NextRequest } from "next/server"
import PDFDocument from "pdfkit"
import { prisma } from "@/lib/prisma"
import { fail, getAuth, HttpError } from "@/lib/api"
import { can } from "@/lib/rbac"
import { getAnalyticsSummary } from "@/lib/analytics"
import { writeAudit, requestMeta } from "@/lib/audit"

export const runtime = "nodejs"

// GET /api/reports/pdf — Modul 12: ekspor ringkasan analitik ke PDF.
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuth()
    if (!can(auth.role, "report:export")) throw new HttpError(403, "FORBIDDEN", "Tidak diizinkan mengekspor")
    const scope = auth.role === "PETUGAS_DINAS" || auth.role === "SUPER_ADMIN" ? null : auth.facilityId
    const s = await getAnalyticsSummary(scope)

    const pdf = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 50 })
      const chunks: Buffer[] = []
      doc.on("data", (c: Buffer) => chunks.push(c))
      doc.on("end", () => resolve(Buffer.concat(chunks)))
      doc.on("error", reject)

      doc.fontSize(20).fillColor("#2563EB").text("BALE CERIBU", { continued: false })
      doc.fontSize(12).fillColor("#0F172A").text("Laporan Ringkasan Skrining Kesehatan Jiwa Ibu (EPDS)")
      doc.moveDown(0.5)
      doc.fontSize(9).fillColor("#64748B").text(`Dicetak: ${new Date().toLocaleString("id-ID")}`)
      doc.moveDown(1)

      const line = (label: string, value: string | number) => {
        doc.fontSize(11).fillColor("#0F172A").text(`${label}: `, { continued: true }).fillColor("#111827").text(String(value))
      }
      doc.fillColor("#111827").fontSize(14).text("Ikhtisar")
      doc.moveDown(0.3)
      line("Total pasien terdaftar", s.totalPatients)
      line("Total skrining selesai", s.totalScreenings)
      line("HIGH ALERT terbuka", s.openHighAlerts)
      line("Kepatuhan follow-up", `${s.followUpCompliancePct}%`)
      line("Closed-loop rujukan", `${s.referralClosedLoopPct}%`)
      doc.moveDown(1)

      doc.fontSize(14).text("Distribusi Risiko")
      doc.moveDown(0.3)
      line("Risiko Rendah (0–9)", s.riskDistribution.LOW)
      line("Risiko Sedang (10–12)", s.riskDistribution.MEDIUM)
      line("Risiko Tinggi (≥13)", s.riskDistribution.HIGH)
      doc.moveDown(1)

      doc.fontSize(9).fillColor("#64748B").text("Catatan privasi: laporan untuk Dinas Kesehatan menyajikan data agregat/anonim. Semua ekspor tercatat pada audit trail.")
      doc.end()
    })

    await writeAudit({ userId: auth.sub, action: "EXPORT", entity: "Report", entityId: "pdf", ...requestMeta(req) })
    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="laporan-ringkasan-epds.pdf"`,
      },
    })
  } catch (err) {
    if (err instanceof HttpError) return fail(err.status, { code: err.code, message: err.message })
    console.error(err)
    return fail(500, { code: "INTERNAL", message: "Gagal membuat PDF" })
  }
}
