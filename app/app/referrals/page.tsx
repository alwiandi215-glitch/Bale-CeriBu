"use client"

import { useEffect, useState } from "react"
import Header from "@/components/Header"
import { api } from "@/lib/http"

type Item = { id: string; reason: string; status: string; urgent: boolean; patient?: { fullName: string }; destinationFacility?: { name: string } | null }

export default function ReferralsPage() {
  const [items, setItems] = useState<Item[]>([])
  async function load() { setItems((await api.get<{ items: Item[] }>("/api/referrals")).items) }
  useEffect(() => { load().catch(() => {}) }, [])

  async function advance(id: string, status: string) {
    await api.patch(`/api/referrals/${id}`, { status })
    load()
  }

  return (
    <>
      <Header title="Rujukan Fasilitas Kesehatan Lanjutan" />
      <main className="flex-1 space-y-4 p-5">
        <div className="surface overflow-hidden rounded-xl">
          <table className="w-full text-sm">
            <thead className="text-muted border-b border-[var(--border)] text-left">
              <tr><th className="p-3">Pasien</th><th className="p-3">Tujuan</th><th className="p-3">Alasan</th><th className="p-3">Status</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-b border-[var(--border)]">
                  <td className="p-3">{r.patient?.fullName ?? "—"} {r.urgent ? <span className="text-risk-alert">⚠️</span> : null}</td>
                  <td className="p-3">{r.destinationFacility?.name ?? "—"}</td>
                  <td className="p-3">{r.reason}</td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3 text-right">
                    {r.status === "SENT" ? <button className="text-brand" onClick={() => advance(r.id, "ACCEPTED")}>Diterima</button> : null}
                    {r.status === "ACCEPTED" ? <button className="text-brand" onClick={() => advance(r.id, "CLOSED")}>Tutup</button> : null}
                    {r.status === "CLOSED" ? <span className="text-risk-low">Selesai</span> : null}
                  </td>
                </tr>
              ))}
              {items.length === 0 ? <tr><td colSpan={5} className="text-muted p-4 text-center">Belum ada rujukan.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}
