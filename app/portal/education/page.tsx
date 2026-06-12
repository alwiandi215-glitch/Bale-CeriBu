"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/http"

type Material = {
  id: string
  slug: string
  title: string
  category: string
  summary: string
  riskTarget: "LOW" | "MEDIUM" | "HIGH" | null
}

export default function PortalEducation() {
  const [items, setItems] = useState<Material[] | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<{ items: Material[] }>("/api/education")
      .then((d) => setItems(d.items))
      .catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat"))
  }, [])

  if (error) return <p className="text-sm text-risk-high">{error}</p>
  if (!items) return <p className="text-muted text-sm">Memuat...</p>

  const categories = [...new Set(items.map((m) => m.category))]

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">Edukasi Kesehatan Jiwa Ibu</h1>
      {categories.map((cat) => (
        <section key={cat}>
          <h2 className="text-muted mb-2 text-sm font-semibold uppercase tracking-wide">{cat}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {items.filter((m) => m.category === cat).map((m) => (
              <button
                key={m.id}
                onClick={() => setOpen(open === m.id ? null : m.id)}
                className="surface rounded-xl p-4 text-left"
              >
                <p className="font-medium">{m.title}</p>
                <p className="text-muted mt-1 text-sm">{m.summary}</p>
                {open === m.id ? (
                  <p className="mt-2 text-sm">Hubungi bidan/perawat Anda untuk materi lengkap dan pendampingan terkait topik ini.</p>
                ) : null}
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
