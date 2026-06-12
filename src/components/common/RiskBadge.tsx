const TONE: Record<string, string> = {
  rendah: 'bg-green-100 text-green-800',
  sedang: 'bg-amber-100 text-amber-800',
  tinggi: 'bg-red-100 text-red-800',
};

export function RiskBadge({ status }: { status?: string | null }) {
  const key = (status ?? '').toLowerCase();
  const tone = TONE[key] ?? 'bg-slate-100 text-slate-700';
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}>
      {status ? status.toUpperCase() : '-'}
    </span>
  );
}
