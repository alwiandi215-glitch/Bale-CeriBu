"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import ThemeToggle from "./ThemeToggle"
import { api } from "@/lib/http"

const NAV: Array<{ href: string; label: string; icon: string }> = [
  { href: "/portal", label: "Beranda", icon: "\u{1F3E0}" },
  { href: "/portal/screening", label: "Skrining EPDS", icon: "\u{1F4DD}" },
  { href: "/portal/education", label: "Edukasi", icon: "\u{1F4DA}" },
  { href: "/portal/notifications", label: "Notifikasi", icon: "\u{1F514}" },
]

export default function PortalNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await api.post("/api/auth/logout", {}).catch(() => {})
    router.push("/")
  }

  return (
    <header className="surface sticky top-0 z-10">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/portal" className="flex items-center gap-2">
          <span aria-hidden className="text-xl">{"\u{1F930}"}</span>
          <span className="font-bold text-brand">BALE CERIBU</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={logout} className="surface rounded-lg px-3 py-1.5 text-sm">Keluar</button>
        </div>
      </div>
      <nav className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-2 pb-2">
        {NAV.map((item) => {
          const active = item.href === "/portal" ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm ${active ? "bg-brand-subtle font-semibold text-brand" : "text-muted hover:bg-brand-subtle/60"}`}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
