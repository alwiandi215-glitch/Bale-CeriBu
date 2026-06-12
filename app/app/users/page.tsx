"use client"

import { useEffect, useState } from "react"
import Header from "@/components/Header"
import { api } from "@/lib/http"

type User = { id: string; fullName: string; email: string; role: string; status: string }
const ROLES = ["SUPER_ADMIN", "ADMIN_FASKES", "DOKTER", "BIDAN", "KADER", "PETUGAS_DINAS"]

export default function UsersPage() {
  const [items, setItems] = useState<User[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "BIDAN" })
  const [error, setError] = useState<string | null>(null)

  async function load() { setItems((await api.get<{ items: User[] }>("/api/users")).items) }
  useEffect(() => { load().catch((e) => setError(e.message)) }, [])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await api.post("/api/users", form)
      setOpen(false)
      setForm({ fullName: "", email: "", password: "", role: "BIDAN" })
      load()
    } catch (err) { setError(err instanceof Error ? err.message : "Gagal") }
  }

  return (
    <>
      <Header title="Manajemen Pengguna" />
      <main className="flex-1 space-y-4 p-5">
        {error ? <p className="text-risk-high text-sm">{error}</p> : null}
        <button className="btn-primary text-sm" onClick={() => setOpen(!open)}>+ Pengguna</button>
        {open ? (
          <form onSubmit={create} className="surface grid gap-3 rounded-xl p-4 sm:grid-cols-2">
            <input className="input" placeholder="Nama lengkap" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <input className="input" type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="input" type="password" placeholder="Kata sandi awal (min 8)" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <button className="btn-primary sm:col-span-2" type="submit">Simpan</button>
          </form>
        ) : null}
        <div className="surface overflow-hidden rounded-xl">
          <table className="w-full text-sm">
            <thead className="text-muted border-b border-[var(--border)] text-left">
              <tr><th className="p-3">Nama</th><th className="p-3">Email</th><th className="p-3">Peran</th><th className="p-3">Status</th></tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id} className="border-b border-[var(--border)]">
                  <td className="p-3 font-medium">{u.fullName}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3">{u.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}
