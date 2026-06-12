import { useQuery } from '@tanstack/react-query';
import { interventionService } from '@/services/intervention.service';

const STATUS = {
  planned: 'bg-slate-100 text-slate-700',
  ongoing: 'bg-sky-100 text-sky-700',
  done: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
} as const;

export function InterventionTracker({ patientId }: { patientId: string }) {
  const { data = [] } = useQuery({
    queryKey: ['interventions', patientId],
    queryFn: () => interventionService.listByPatient(patientId),
  });
  return (
    <ul className="space-y-2">
      {data.map((i: any) => (
        <li key={i.id} className="rounded-xl bg-white dark:bg-slate-800 p-3 shadow-sm flex justify-between">
          <div>
            <p className="font-medium">{i.intervention_types?.name}</p>
            <p className="text-sm text-slate-500">{i.notes}</p>
          </div>
          <span className={`self-start rounded-full px-2 py-0.5 text-xs ${STATUS[i.status as keyof typeof STATUS]}`}>
            {i.status}
          </span>
        </li>
      ))}
    </ul>
  );
}
