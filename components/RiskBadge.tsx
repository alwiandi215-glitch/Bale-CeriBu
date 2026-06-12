import type { RiskLevel } from "@prisma/client"

const MAP: Record<string, { label: string; cls: string }> = {
  LOW: { label: "Rendah", cls: "bg-risk-low/15 text-risk-low" },
  MEDIUM: { label: "Sedang", cls: "bg-risk-medium/15 text-risk-medium" },
  HIGH: { label: "Tinggi", cls: "bg-risk-high/15 text-risk-high" },
}

export default function RiskBadge({ level, highAlert }: { level?: RiskLevel | string | null; highAlert?: boolean }) {
  if (highAlert) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-risk-alert/15 px-2.5 py-0.5 text-xs font-semibold text-risk-alert">
        ⚠️ HIGH ALERT
      </span>
    )
  }
  const m = level ? MAP[level] : undefined
  if (!m) return <span className="text-muted text-xs">—</span>
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${m.cls}`}>{m.label}</span>
}
