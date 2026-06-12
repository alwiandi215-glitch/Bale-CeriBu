export default function KpiCard({
  label,
  value,
  hint,
  tone = "brand",
}: {
  label: string
  value: string | number
  hint?: string
  tone?: "brand" | "low" | "medium" | "high" | "alert"
}) {
  const toneCls: Record<string, string> = {
    brand: "text-brand",
    low: "text-risk-low",
    medium: "text-risk-medium",
    high: "text-risk-high",
    alert: "text-risk-alert",
  }
  return (
    <div className="surface rounded-xl p-4">
      <p className="text-muted text-sm">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${toneCls[tone]}`}>{value}</p>
      {hint ? <p className="text-muted mt-1 text-xs">{hint}</p> : null}
    </div>
  )
}
