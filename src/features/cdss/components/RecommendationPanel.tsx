import { FiArrowRightCircle } from 'react-icons/fi';
import type { CdssActionDef } from '../cdss.types';

const TONE = {
  critical: 'border-red-300 bg-red-50 text-red-800',
  high: 'border-orange-300 bg-orange-50 text-orange-800',
  medium: 'border-amber-300 bg-amber-50 text-amber-800',
  low: 'border-emerald-300 bg-emerald-50 text-emerald-800',
} as const;

export function RecommendationPanel({ actions }: { actions: CdssActionDef[] }) {
  if (!actions.length) return null;
  return (
    <section className="space-y-3">
      <h3 className="font-semibold">Rekomendasi Tindakan (CDSS)</h3>
      {actions.map((a, i) => (
        <div key={i} className={`rounded-xl border p-3 flex items-start gap-3 ${TONE[a.priority]}`}>
          <FiArrowRightCircle className="size-5 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">{a.label}</p>
            <p className="text-xs uppercase tracking-wide opacity-70">
              {a.type} · prioritas {a.priority}
            </p>
          </div>
          <button className="rounded-lg bg-white/70 px-3 py-1 text-sm font-medium">Terapkan</button>
        </div>
      ))}
    </section>
  );
}
