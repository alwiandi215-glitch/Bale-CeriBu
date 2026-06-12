"use client"

import { useEffect, useState } from "react"
import Header from "@/components/Header"
import KpiCard from "@/components/KpiCard"
import RiskDistribution from "@/components/RiskDistribution"
import HighAlertBanner from "@/components/HighAlertBanner"
import { api } from "@/lib/http"
import type { AnalyticsSummary } from "@/lib/analytics"

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<AnalyticsSummary>("/api/analytics").then(setData).catch((e) => setError(e.message))
  }, [])

  return (
    <>
      <Header title="Dashboard Analitik" />
      <main className="flex-1 space-y-5 p-5">
        {error ? <p className="text-risk-high">{error}</p> : null}
        {!data ? (
          <p className="text-muted">Memuat data…</p>
        ) : (
          <>
            <HighAlertBanner count={data.openHighAlerts} />
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KpiCard label="Total Pasien" value={data.totalPatients} />
              <KpiCard label="Skrining Selesai" value={data.totalScreenings} />
              <KpiCard label="Kepatuhan Follow-up" value={`${data.followUpCompliancePct}%`} tone="medium" />
              <KpiCard label="Closed-loop Rujukan" value={`${data.referralClosedLoopPct}%`} tone="low" />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <RiskDistribution low={data.riskDistribution.LOW} medium={data.riskDistribution.MEDIUM} high={data.riskDistribution.HIGH} />
              <div className="surface rounded-xl p-4">
                <p className="mb-3 text-sm font-semibold">Aktivitas Terbaru</p>
                <ul className="space-y-2">
                  {data.recentActivities.length === 0 ? (
                    <li className="text-muted text-sm">Belum ada aktivitas.</li>
                  ) : (
                    data.recentActivities.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-muted text-xs">{new Date(a.createdAt).toLocaleString("id-ID")}</span>
                        <span>{a.message}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  )
}
