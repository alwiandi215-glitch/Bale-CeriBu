"use client"

import { useEffect, useState } from "react"
import Header from "@/components/Header"
import { api } from "@/lib/http"

type Material = { id: string; slug: string; title: string; category: string; summary?: string | null; riskTarget?: string | null }

export default function EducationPage() {
  const [items, setItems] = useState<Material[]>([])
  useEffect(() => { api.get<{ items: Material[] }>("/api/education").then((d) => setItems(d.items)).catch(() => {}) }, [])

  return (
    <>
      <Header title="Edukasi Pasien" />
      <main className="flex-1 space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <div key={m.id} className="surface rounded-xl p-4">
              <p className="text-muted text-xs uppercase">{m.category}</p>
              <p className="mt-1 font-semibold">{m.title}</p>
              <p className="text-muted mt-2 text-sm">{m.summary}</p>
            </div>
          ))}
          {items.length === 0 ? <p className="text-muted">Belum ada materi edukasi.</p> : null}
        </div>
      </main>
    </>
  )
}
