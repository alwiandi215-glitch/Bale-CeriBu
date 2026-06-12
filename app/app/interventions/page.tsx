"use client"

import { useEffect, useState } from "react"
import Header from "@/components/Header"
import { api } from "@/lib/http"

type Item = { id: string; title: string; type: string; status: string; dueDate?: string | null; patient?: { fullName: string; mrn: string } }

export default function InterventionsPage() {
  const [items, setItems] = useState<Item[]>([])
  async function load() { setItems((await api.get<{ items: Item[] }>("/api/interventions")).items) }
  useEffect(() => { load().catch(() => {}) }, [])

  async function setStatus(id: string, status: string) {
    await api.patch(`/api/interventions?id=${id}`, { status })
    load()
  }

  return (
    <>
      <Header title="Rekomendasi Intervensi & Tindak Lanjut" />
      <main className="flex-1 space-y-4 p-5">
        <div className="surface overflow-hidden rounded-xl">
          <table className="w-full text-sm">
            <thead className="text-muted border-b border-[var(--border)] text-left">
              <tr><th className="p-3">Pasien</th><th className="p-3">Intervensi</th><th className="p-3">Jenis</th><th className="p-3">Jatuh Tempo</th><th className="p-3">Status</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id} className="border-b border-[var(--border)]">
                  <td className="p-3">{i.patient?.fullName ?? "—"}</td>
                  <td className="p-3 font-medium">{i.title}</td>
                  <td className="p-3">{i.type}</td>
                  <td className="p-3">{i.dueDate ? new Date(i.dueDate).toLocaleDateString("id-ID") : "—"}</td>
                  <td className="p-3">{i.status}</td>
                  <td className="p-3 text-right">
                    {i.status !== "COMPLETED" ? <button className="text-brand" onClick={() => setStatus(i.id, "COMPLETED")}>Tandai selesai</button> : <span className="text-risk-low">✓</span>}
                  </td>
                </tr>
              ))}
              {items.length === 0 ? <tr><td colSpan={6} className="text-muted p-4 text-center">Belum ada intervensi.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}
