"use client"

import { useEffect, useState } from "react"
import Header from "@/components/Header"
import { api } from "@/lib/http"

type Item = { id: string; title: string; channel: string; status: string; scheduledAt: string; patient?: { fullName: string } }

export default function MonitoringPage() {
  const [items, setItems] = useState<Item[]>([])
  async function load() { setItems((await api.get<{ items: Item[] }>("/api/reminders")).items) }
  useEffect(() => { load().catch(() => {}) }, [])

  return (
    <>
      <Header title="Monitoring & Reminder" />
      <main className="flex-1 space-y-4 p-5">
        <p className="text-muted text-sm">Reminder dikirim otomatis melalui WhatsApp Gateway oleh penjadwal (Netlify Scheduled Function di <code>/api/cron/reminders</code>).</p>
        <div className="surface overflow-hidden rounded-xl">
          <table className="w-full text-sm">
            <thead className="text-muted border-b border-[var(--border)] text-left">
              <tr><th className="p-3">Pasien</th><th className="p-3">Judul</th><th className="p-3">Kanal</th><th className="p-3">Jadwal</th><th className="p-3">Status</th></tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-b border-[var(--border)]">
                  <td className="p-3">{r.patient?.fullName ?? "—"}</td>
                  <td className="p-3 font-medium">{r.title}</td>
                  <td className="p-3">{r.channel}</td>
                  <td className="p-3">{new Date(r.scheduledAt).toLocaleString("id-ID")}</td>
                  <td className="p-3">{r.status}</td>
                </tr>
              ))}
              {items.length === 0 ? <tr><td colSpan={5} className="text-muted p-4 text-center">Belum ada reminder terjadwal.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}
