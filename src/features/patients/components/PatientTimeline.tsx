import { useQuery } from '@tanstack/react-query';
import { patientService } from '@/services/patient.service';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function PatientTimeline({ patientId }: { patientId: string }) {
  const { data = [] } = useQuery({
    queryKey: ['timeline', patientId],
    queryFn: () => patientService.timeline(patientId),
  });
  return (
    <ol className="relative border-l border-slate-200 dark:border-slate-700 ml-3">
      {(data ?? []).map((t: any) => (
        <li key={t.id} className="mb-6 ml-4">
          <div className="absolute -left-1.5 size-3 rounded-full bg-emerald-500" />
          <time className="text-xs text-slate-400">
            {format(new Date(t.created_at), 'dd MMM yyyy HH:mm', { locale: id })}
          </time>
          <p className="text-sm font-medium capitalize">{t.event_type}</p>
          <p className="text-sm text-slate-500">{t.summary}</p>
        </li>
      ))}
    </ol>
  );
}
