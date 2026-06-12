"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Header from "@/components/Header"
import RiskBadge from "@/components/RiskBadge"
import { api } from "@/lib/http"

type Screening = { id: string; totalScore?: number | null; riskLevel?: string | null; highAlert: boolean; status: string; startedAt: string }
type Patient = {
  id: string; fullName: string; mrn: string; status: string; phone?: string | null
  city?: string | null; district?: string | null; bpjsNumber?: string | null
  screenings: Screening[]
}

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [p, setP] = useState<Patient | null>(null)

  useEffect(() => { api.get<Patient>(`/api/patients/${id}`).then(setP).catch(() => {}) }, [id])

  if (!p) return (<><Header title="Detail Pasien" /><main className="p-5"><p className="text-muted">Memuat…</p></main></>)

  return (
    <>
      <Header title={`Pasien — ${p.fullName}`} />
      <main className="flex-1 space-y-4 p-5">
        <div className="surface grid gap-2 rounded-xl p-4 sm:grid-cols-2">
          <p><span className="text-muted">No. RM:</span> <span className="font-mono">{p.mrn}</span></p>
          <p><span className="text-muted">Status:</span> {p.status}</p>
          <p><span className="text-muted">Kontak:</span> {p.phone ?? "—"}</p>
          <p><span className="text-muted">Wilayah:</span> {[p.district, p.city].filter(Boolean).join(", ") || "—"}</p>
          <p><span className="text-muted">BPJS:</span> {p.bpjsNumber ?? "—"}</p>
        </div>
        <div className="surface overflow-hidden rounded-xl">
          <p className="border-b border-[var(--border)] p-3 font-semibold">Riwayat Skrining EPDS</p>
          <table className="w-full text-sm">
            <thead className="text-muted text-left"><tr><th className="p-3">Tanggal</th><th className="p-3">Skor</th><th className="p-3">Risiko</th><th className="p-3">Status</th></tr></thead>
            <tbody>
              {p.screenings.map((s) => (
                <tr key={s.id} className="border-t border-[var(--border)]">
                  <td className="p-3">{new Date(s.startedAt).toLocaleDateString("id-ID")}</td>
                  <td className="p-3">{s.totalScore ?? "—"}</td>
                  <td className="p-3"><RiskBadge level={s.riskLevel} highAlert={s.highAlert} /></td>
                  <td className="p-3">{s.status}</td>
                </tr>
              ))}
              {p.screenings.length === 0 ? <tr><td colSpan={4} className="text-muted p-4 text-center">Belum ada skrining.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}
