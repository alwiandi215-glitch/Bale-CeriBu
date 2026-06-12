import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { useEwsRealtime } from '../useEwsRealtime';
import { EmptyState } from '@/components/common/EmptyState';

export default function MonitoringPage() {
  const { alerts, acknowledge } = useEwsRealtime();
  return (
    <div className="space-y-4">
      <header className="flex items-center gap-2">
        <span className="relative flex size-3">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex size-3 rounded-full bg-red-500" />
        </span>
        <h1 className="text-2xl font-bold">Monitoring EWS — Realtime</h1>
      </header>

      {alerts.length === 0 ? (
        <EmptyState title="Tidak ada alert aktif ✨" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`rounded-2xl border-l-4 bg-white dark:bg-slate-800 p-4 shadow ${a.level === 'tinggi' ? 'border-red-500' : 'border-amber-500'}`}
            >
              <div className="flex justify-between">
                <span
                  className={`text-xs font-semibold uppercase ${a.level === 'tinggi' ? 'text-red-600' : 'text-amber-600'}`}
                >
                  {a.level}
                </span>
                <span className="text-xs text-slate-400">
                  {formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: id })}
                </span>
              </div>
              <p className="mt-1 text-sm">{a.reason}</p>
              <div className="mt-3 flex gap-2">
                <Link to={`/patients/${a.patient_id}`} className="text-emerald-600 text-sm">
                  Lihat pasien
                </Link>
                <button
                  onClick={() => acknowledge(a.id)}
                  className="ml-auto rounded-lg bg-emerald-600 text-white px-3 py-1 text-sm"
                >
                  Tindak lanjuti
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
