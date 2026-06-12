"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV: Array<{ href: string; label: string; icon: string }> = [
  { href: "/app/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/app/patients", label: "Pasien", icon: "👩‍🍼" },
  { href: "/app/screening", label: "Skrining EPDS", icon: "📝" },
  { href: "/app/interventions", label: "Intervensi", icon: "🩺" },
  { href: "/app/referrals", label: "Rujukan", icon: "🏥" },
  { href: "/app/monitoring", label: "Monitoring & Reminder", icon: "⏰" },
  { href: "/app/education", label: "Edukasi", icon: "📚" },
  { href: "/app/reports", label: "Laporan", icon: "📄" },
  { href: "/app/users", label: "Pengguna", icon: "👥" },
  { href: "/app/audit", label: "Audit Log", icon: "🔍" },
  { href: "/app/settings", label: "Pengaturan", icon: "⚙️" },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="surface hidden w-64 shrink-0 flex-col p-3 md:flex">
      <div className="mb-4 px-2 py-1">
        <p className="text-lg font-bold text-brand">🤰 BALE CERIBU</p>
        <p className="text-muted text-xs">Kesehatan Jiwa Ibu</p>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${active ? "bg-brand-subtle font-semibold text-brand" : "text-muted hover:bg-brand-subtle/60"}`}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
