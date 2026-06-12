"use client"

import Header from "@/components/Header"

export default function ReportsPage() {
  return (
    <>
      <Header title="Laporan" />
      <main className="flex-1 space-y-4 p-5">
        <p className="text-muted">Ekspor rekapitulasi skrining dan ringkasan analitik. Semua ekspor tercatat pada audit trail.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="surface rounded-xl p-5">
            <p className="text-lg font-semibold">📄 Laporan PDF</p>
            <p className="text-muted mt-1 text-sm">Ringkasan analitik: distribusi risiko, HIGH ALERT, kepatuhan follow-up, closed-loop rujukan.</p>
            <a className="btn-primary mt-4 inline-block text-sm" href="/api/reports/pdf" target="_blank" rel="noreferrer">Unduh PDF</a>
          </div>
          <div className="surface rounded-xl p-5">
            <p className="text-lg font-semibold">📊 Laporan Excel</p>
            <p className="text-muted mt-1 text-sm">Rekap baris-per-skrining (untuk Dinas: data agregat/anonim).</p>
            <a className="btn-primary mt-4 inline-block text-sm" href="/api/reports/excel" target="_blank" rel="noreferrer">Unduh Excel</a>
          </div>
        </div>
      </main>
    </>
  )
}
