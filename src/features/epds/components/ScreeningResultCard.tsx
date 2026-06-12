import { interpret } from '../epds.schema';

const TONE = {
  rendah: 'bg-green-100 text-green-800',
  sedang: 'bg-amber-100 text-amber-800',
  tinggi: 'bg-red-100 text-red-800',
} as const;

export function ScreeningResultCard({
  score,
  level,
}: {
  score: number;
  level: 'rendah' | 'sedang' | 'tinggi';
}) {
  const info = interpret(score);
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 p-5 shadow text-center">
      <p className="text-sm text-slate-500">Skor EPDS</p>
      <p className="text-4xl font-bold my-1">
        {score}
        <span className="text-lg font-normal">/30</span>
      </p>
      <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${TONE[level]}`}>
        {level.toUpperCase()}
      </span>
      <p className="mt-2 text-sm text-slate-600">{info.label}</p>
    </div>
  );
}
