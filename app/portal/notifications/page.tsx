"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/http"

type Notif = {
  id: string
  title: string
  message: string
  channel: string
  status: string
  scheduledAt: string
  sentAt: string | null
}

const CHANNEL: Record<string, string> = { WHATSAPP: "WhatsApp", SMS: "SMS", EMAIL: "Email", IN_APP: "Aplikasi" }

function fmt(d: string): string {
  return new Date(d).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export default function PortalNotifications() {
  const [items, setItems] = useState<Notif[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<{ items: Notif[] }>("/api/me/notifications")
      .then((d) => setItems(d.items))
      .catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat"))
  }, [])

  if (error) return <p className="text-sm text-risk-high">{error}</p>
  if (!items) return <p className="text-muted text-sm">Memuat...</p>

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Notifikasi & Pengingat</h1>
      {items.length ? (
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n.id} className="surface rounded-xl p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{n.title}</p>
                <span className="text-muted text-xs">{CHANNEL[n.channel] ?? n.channel}</span>
              </div>
              <p className="text-sm">{n.message}</p>
              <p className="text-muted mt-1 text-xs">
                {n.status === "SENT" && n.sentAt ? `Dikirim ${fmt(n.sentAt)}` : `Dijadwalkan ${fmt(n.scheduledAt)}`}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted text-sm">Belum ada notifikasi.</p>
      )}
    </div>
  )
}
