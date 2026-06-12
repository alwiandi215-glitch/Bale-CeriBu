"use client"

import { useEffect, useState } from "react"
import Header from "@/components/Header"
import { api } from "@/lib/http"

type AuditItem = { id: string; action: string; entity: string; entityId?: string | null; createdAt: string; user?: { fullName: string } | null }
type ActivityItem = { id: string; type: string; message: string; createdAt: string; user?: { fullName: string } | null }

export default function AuditPage() {
  const [tab, setTab] = useState<"audit" | "activity">("audit")
  const [audit, setAudit] = useState<AuditItem[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])

  useEffect(() => {
    api.get<{ items: AuditItem[] }>("/api/audit").then((d) => setAudit(d.items)).catch(() => {})
    api.get<{ items: ActivityItem[] }>("/api/audit?type=activity").then((d) => setActivity(d.items)).catch(() => {})
  }, [])

  return (
    <>
      <Header title="Audit Log & Activity Log" />
      <main className="flex-1 space-y-4 p-5">
        <div className="flex gap-2">
          <button className={`rounded-lg px-3 py-1.5 text-sm ${tab === "audit" ? "btn-primary" : "surface"}`} onClick={() => setTab("audit")}>Audit Trail</button>
          <button className={`rounded-lg px-3 py-1.5 text-sm ${tab === "activity" ? "btn-primary" : "surface"}`} onClick={() => setTab("activity")}>Activity Log</button>
        </div>
        <div className="surface overflow-hidden rounded-xl">
          {tab === "audit" ? (
            <table className="w-full text-sm">
              <thead className="text-muted border-b border-[var(--border)] text-left"><tr><th className="p-3">Waktu</th><th className="p-3">Aktor</th><th className="p-3">Aksi</th><th className="p-3">Entitas</th></tr></thead>
              <tbody>
                {audit.map((a) => (
                  <tr key={a.id} className="border-b border-[var(--border)]">
                    <td className="p-3 text-xs">{new Date(a.createdAt).toLocaleString("id-ID")}</td>
                    <td className="p-3">{a.user?.fullName ?? "Sistem"}</td>
                    <td className="p-3 font-medium">{a.action}</td>
                    <td className="p-3">{a.entity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {activity.map((a) => (
                <li key={a.id} className="flex items-start gap-3 p-3 text-sm">
                  <span className="text-muted text-xs">{new Date(a.createdAt).toLocaleString("id-ID")}</span>
                  <span className="font-medium">[{a.type}]</span>
                  <span>{a.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  )
}
