export default function HighAlertBanner({ count }: { count: number }) {
  if (!count) return null
  return (
    <div className="flex items-center justify-between rounded-xl border border-risk-alert/40 bg-risk-alert/10 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden>⚠️</span>
        <div>
          <p className="font-semibold text-risk-alert">{count} kasus HIGH ALERT memerlukan tindak lanjut segera</p>
          <p className="text-muted text-xs">Item 10 (pikiran menyakiti diri) positif — SLA 24 jam.</p>
        </div>
      </div>
      <a href="/app/screening?highAlert=true" className="btn-primary text-sm">Tinjau</a>
    </div>
  )
}
