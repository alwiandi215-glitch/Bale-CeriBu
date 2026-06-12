"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { api } from "@/lib/http"

type ScreeningRow = {
  id: string
  status: string
  totalScore: number | null
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | null
  highAlert: boolean
  startedAt: string
  completedAt: string | null
}
type MeData = {
  patient: { fullName: string; status: string; gestationalAge: number | null; facility: { name: string; phone: string | null } | null }
  latest: ScreeningRow | null
  draft: ScreeningRow | null
  history: ScreeningRow[]
}

const RISK_TEXT: Record<string, string> = { LOW: "Risiko Rendah", MEDIUM: "Risiko Sedang", HIGH: "Risiko Tinggi" }
const RISK_CLASS: Record<string, string> = {
  LOW: "text-risk-low", MEDIUM: "text-risk-medium", HIGH: "text-risk-high",
}

function fmt(d: string | null): string {
  if (!d) return "-"
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

export default function PortalHome() {
  const [data, setData] = useState<MeData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<MeData>("/api/me").then(setData).catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat"))
  }, [])

  if (error) {
    return (
      <div className="surface rounded-xl p-5">
        <p className="text-sm text-risk-high">{error}</p>
      </div>
    )
  }
  if (!data) return <p className="text-muted text-sm">Memuat...</p>

  const latest = data.latest
  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-xl font-bold">Halo, {data.patient.fullName} {"\u{1F44B}"}</h1>
        <p className="text-muted text-sm">
          {data.patient.status === "PREGNANT" ? "Ibu Hamil" : data.patient.status === "POSTPARTUM" ? "Ibu Postpartum" : ""}
          {data.patient.gestationalAge ? ` \u00B7 ${data.patient.gestationalAge} minggu` : ""}
          {data.patient.facility ? ` \u00B7 ${data.patient.facility.name}` : ""}
        </p>
      </section>

      {latest?.highAlert ? (
        <div className="rounded-xl border border-risk-high bg-risk-high/10 p-4">
          <p className="font-semibold text-risk-high">Kondisi Anda perlu perhatian segera</p>
          <p className="text-sm">Tenaga kesehatan Anda telah diberi tahu. Jika Anda merasa ingin menyakiti diri sendiri, segera hubungi petugas faskes{data.patient.facility?.phone ? ` (${data.patient.facility.phone})` : ""} atau layanan darurat 112.</p>
        </div>
      ) : null}

      <section className="surface rounded-xl p-5">
        <p className="text-muted text-xs uppercase tracking-wide">Kondisi terkini</p>
        {latest ? (
          <div className="mt-1">
            <p className={`text-2xl font-bold ${RISK_CLASS[latest.riskLevel ?? "LOW"]}`}>
              {RISK_TEXT[latest.riskLevel ?? "LOW"]}
            </p>
            <p className="text-muted text-sm">Skrining terakhir {fmt(latest.completedAt)} \u00B7 skor {latest.totalScore ?? "-"}/30</p>
          </div>
        ) : (
          <p className="mt-1 text-sm">Anda belum pernah mengisi skrining. Mari mulai sekarang.</p>
        )}
        <Link href="/portal/screening" className="btn-primary mt-3 inline-block">
          {data.draft ? "Lanjutkan skrining" : "Mulai skrining EPDS"}
        </Link>
      </section>

      <section className="surface rounded-xl p-5">
        <p className="mb-2 font-semibold">Riwayat skrining</p>
        {data.history.length ? (
          <ul className="divide-y divide-[var(--border)]">
            {data.history.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2 text-sm">
                <span>{fmt(s.completedAt)}</span>
                <span className={RISK_CLASS[s.riskLevel ?? "LOW"]}>{RISK_TEXT[s.riskLevel ?? "LOW"]} ({s.totalScore ?? "-"})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted text-sm">Belum ada riwayat.</p>
        )}
      </section>

      <p className="text-muted text-xs">
        Catatan: EPDS adalah alat bantu skrining, bukan diagnosis. Hasil Anda menjadi dasar tenaga kesehatan untuk menindaklanjuti.
      </p>
    </div>
  )
}
