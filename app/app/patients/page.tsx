"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Header from "@/components/Header"
import { api } from "@/lib/http"

type Patient = { id: string; fullName: string; mrn: string; status: string; phone?: string | null; city?: string | null }

export default function PatientsPage() {
  const [items, setItems] = useState<Patient[]>([])
  const [q, setQ] = useState("")
  const [form, setForm] = useState({ mrn: "", fullName: "", phone: "", status: "PREGNANT" })
  const [open, setOpen] = useState(false)

  async function load() {
    const d = await api.get<{ items: Patient[] }>(`/api/patients?q=${encodeURIComponent(q)}`)
    setItems(d.items)
  }
  useEffect(() => { load().catch(() => {}) }, [])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    await api.post("/api/patients", form)
    setOpen(false)
    setForm({ mrn: "", fullName: "", phone: "", status: "PREGNANT" })
    load()
  }

  return (
    <>
      <Header title="Manajemen Data Pasien" />
      <main className="flex-1 space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <input className="input max-w-xs" placeholder="Cari nama / no. RM…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} />
          <button className="surface rounded-lg px-3 py-2 text-sm" onClick={load}>Cari</button>
          <button className="btn-primary ml-auto text-sm" onClick={() => setOpen(!open)}>+ Pasien</button>
        </div>

        {open ? (
          <form onSubmit={create} className="surface grid gap-3 rounded-xl p-4 sm:grid-cols-2">
            <input className="input" placeholder="No. RM" required value={form.mrn} onChange={(e) => setForm({ ...form, mrn: e.target.value })} />
            <input className="input" placeholder="Nama lengkap" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <input className="input" placeholder="No. WhatsApp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="PREGNANT">Hamil</option>
              <option value="POSTPARTUM">Pascapersalinan</option>
            </select>
            <button className="btn-primary sm:col-span-2" type="submit">Simpan</button>
          </form>
        ) : null}

        <div className="surface overflow-hidden rounded-xl">
          <table className="w-full text-sm">
            <thead className="text-muted border-b border-[var(--border)] text-left">
              <tr><th className="p-3">No. RM</th><th className="p-3">Nama</th><th className="p-3">Status</th><th className="p-3">Kontak</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b border-[var(--border)]">
                  <td className="p-3 font-mono text-xs">{p.mrn}</td>
                  <td className="p-3 font-medium">{p.fullName}</td>
                  <td className="p-3">{p.status}</td>
                  <td className="p-3">{p.phone ?? "—"}</td>
                  <td className="p-3 text-right"><Link className="text-brand" href={`/app/patients/${p.id}`}>Detail</Link></td>
                </tr>
              ))}
              {items.length === 0 ? <tr><td colSpan={5} className="text-muted p-4 text-center">Belum ada data pasien.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}
