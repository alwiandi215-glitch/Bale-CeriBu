"use client"

import { useEffect, useState } from "react"
import Header from "@/components/Header"
import { api } from "@/lib/http"

type Setting = { id: string; key: string; value: unknown; category: string }

export default function SettingsPage() {
  const [items, setItems] = useState<Setting[]>([])
  const [editing, setEditing] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState<string | null>(null)

  async function load() { setItems((await api.get<{ items: Setting[] }>("/api/settings")).items) }
  useEffect(() => { load().catch(() => {}) }, [])

  async function save(key: string) {
    const raw = editing[key] ?? ""
    let value: unknown = raw
    try { value = JSON.parse(raw) } catch { /* simpan sebagai string */ }
    await api.put("/api/settings", { key, value, category: items.find((i) => i.key === key)?.category ?? "general" })
    setMsg(`Tersimpan: ${key}`)
    load()
  }

  return (
    <>
      <Header title="Pengaturan Sistem" />
      <main className="flex-1 space-y-4 p-5">
        {msg ? <p className="text-risk-low text-sm">{msg}</p> : null}
        <div className="surface divide-y divide-[var(--border)] rounded-xl">
          {items.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center gap-3 p-3">
              <div className="min-w-48">
                <p className="font-medium">{s.key}</p>
                <p className="text-muted text-xs">{s.category}</p>
              </div>
              <input className="input max-w-md flex-1" defaultValue={JSON.stringify(s.value)} onChange={(e) => setEditing({ ...editing, [s.key]: e.target.value })} />
              <button className="surface rounded-lg px-3 py-1.5 text-sm" onClick={() => save(s.key)}>Simpan</button>
            </div>
          ))}
          {items.length === 0 ? <p className="text-muted p-4">Belum ada pengaturan. Jalankan seed untuk nilai awal.</p> : null}
        </div>
      </main>
    </>
  )
}
