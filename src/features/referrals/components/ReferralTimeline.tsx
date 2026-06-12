import { useQuery } from '@tanstack/react-query';
import { referralService } from '@/services/referral.service';

const FLOW = ['requested', 'accepted', 'in_progress', 'completed'];

export function ReferralTimeline({ patientId }: { patientId: string }) {
  const { data = [] } = useQuery({
    queryKey: ['referrals', patientId],
    queryFn: () => referralService.listByPatient(patientId),
  });
  return (
    <div className="space-y-4">
      {data.map((r: any) => (
        <div key={r.id} className="rounded-2xl bg-white dark:bg-slate-800 p-4 shadow">
          <div className="flex justify-between">
            <p className="font-medium">→ {r.to_facility}</p>
            <span
              className={`text-xs rounded-full px-2 py-0.5 ${r.urgency === 'darurat' ? 'bg-red-100 text-red-700' : r.urgency === 'segera' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}
            >
              {r.urgency}
            </span>
          </div>
          <p className="text-sm text-slate-500">{r.reason}</p>
          <ol className="mt-3 flex gap-1">
            {FLOW.map((step) => {
              const done = FLOW.indexOf(step) <= FLOW.indexOf(r.status);
              return (
                <li
                  key={step}
                  className={`flex-1 h-1.5 rounded-full ${done ? 'bg-emerald-500' : 'bg-slate-200'}`}
                />
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}
