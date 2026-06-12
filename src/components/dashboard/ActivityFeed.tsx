import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';

interface ActivityRow {
  id: string;
  event_type: string;
  summary: string;
  created_at: string;
}

export function ActivityFeed() {
  const { data = [] } = useQuery({
    queryKey: ['activity-feed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_timeline')
        .select('id, event_type, summary, created_at')
        .order('created_at', { ascending: false })
        .limit(8);
      if (error) throw new Error(error.message);
      return (data ?? []) as ActivityRow[];
    },
  });

  return (
    <div className="rounded-2xl bg-white/80 dark:bg-slate-800 p-5 shadow">
      <h3 className="font-semibold mb-3">Aktivitas Terbaru</h3>
      {data.length === 0 ? (
        <p className="text-sm text-slate-500">Belum ada aktivitas.</p>
      ) : (
        <ul className="space-y-3">
          {data.map((a) => (
            <li key={a.id} className="text-sm">
              <p className="font-medium capitalize">{a.event_type}</p>
              <p className="text-slate-500">{a.summary}</p>
              <time className="text-xs text-slate-400">
                {formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: id })}
              </time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ActivityFeed;
