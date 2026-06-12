"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ThemeToggle from "@/components/ThemeToggle"
import { api } from "@/lib/http"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.post<{ user: { role: string } }>("/api/auth/login", { email, password })
      // Ibu (akun mandiri) diarahkan ke portal pasien; klinisi/admin ke area klinis.
      router.push(res.user.role === "IBU" ? "/portal" : "/app/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal masuk")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="surface w-full max-w-md rounded-2xl p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="text-4xl" aria-hidden>
            🤰
          </div>
          <h1 className="mt-2 text-2xl font-bold text-brand">BALE CERIBU</h1>
          <p className="text-muted text-sm">
            Balai Edukasi, Cegah, Risiko &amp; Intervensi Kesehatan Jiwa Ibu
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@faskes.go.id" className="input" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="password">Kata Sandi</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input" />
          </div>
          {error ? <p className="text-sm text-risk-high">{error}</p> : null}
          <button type="submit" disabled={loading} className="btn-primary block w-full text-center">
            {loading ? "Memproses…" : "Masuk"}
          </button>
        </form>

        <p className="text-muted mt-6 text-center text-xs">
          Akun demo (setelah seed): admin@baleceribu.id / Admin#12345
        </p>
        <div className="mt-4 flex justify-center">
          <ThemeToggle />
        </div>
      </div>
    </main>
  )
}
