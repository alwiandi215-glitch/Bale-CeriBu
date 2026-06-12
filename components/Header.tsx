"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ThemeToggle from "./ThemeToggle"
import { api } from "@/lib/http"

type Me = { user: { fullName: string; role: string; facility?: { name: string } | null } }

export default function Header({ title }: { title: string }) {
  const router = useRouter()
  const [me, setMe] = useState<Me | null>(null)

  useEffect(() => {
    api.get<Me>("/api/auth/me").then(setMe).catch(() => router.push("/"))
  }, [router])

  async function logout() {
    await api.post("/api/auth/logout", {}).catch(() => {})
    router.push("/")
  }

  return (
    <header className="surface flex items-center justify-between px-5 py-3">
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {me ? (
          <div className="text-right">
            <p className="text-sm font-medium">{me.user.fullName}</p>
            <p className="text-muted text-xs">{me.user.facility?.name ?? me.user.role}</p>
          </div>
        ) : null}
        <button onClick={logout} className="surface rounded-lg px-3 py-1.5 text-sm">Keluar</button>
      </div>
    </header>
  )
}
