import type { CSSProperties } from "react"

export default function RiskDistribution({ low, medium, high }: { low: number; medium: number; high: number }) {
  const total = Math.max(1, low + medium + high)
  const barStyle = (n: number): CSSProperties => ({ width: `${Math.round((n / total) * 100)}%` })
  return (
    <div className="surface rounded-xl p-4">
      <p className="mb-3 text-sm font-semibold">Distribusi Risiko</p>
      <div className="mb-3 flex h-3 w-full overflow-hidden rounded-full">
        <div className="bg-risk-low" style={barStyle(low)} />
        <div className="bg-risk-medium" style={barStyle(medium)} />
        <div className="bg-risk-high" style={barStyle(high)} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div><p className="font-bold text-risk-low">{low}</p><p className="text-muted text-xs">Rendah (0–9)</p></div>
        <div><p className="font-bold text-risk-medium">{medium}</p><p className="text-muted text-xs">Sedang (10–12)</p></div>
        <div><p className="font-bold text-risk-high">{high}</p><p className="text-muted text-xs">Tinggi (≥13)</p></div>
      </div>
    </div>
  )
}
