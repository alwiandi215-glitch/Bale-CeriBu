import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services/audit.service';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function AuditLogTable() {
  const { data } = useQuery({ queryKey: ['audit'], queryFn: () => auditService.list() });
  return (
    <table className="w-full text-sm bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow">
      <thead className="bg-slate-50 dark:bg-slate-700 text-left">
        <tr>
          <th className="p-3">Waktu</th>
          <th className="p-3">Aktor</th>
          <th className="p-3">Aksi</th>
          <th className="p-3">Entitas</th>
        </tr>
      </thead>
      <tbody>
        {(data?.rows ?? []).map((r: any) => (
          <tr key={r.id} className="border-t">
            <td className="p-3">{format(new Date(r.created_at), 'dd MMM yyyy HH:mm', { locale: id })}</td>
            <td className="p-3">{r.profiles?.full_name ?? r.actor_id}</td>
            <td className="p-3">
              <code className="text-xs">{r.action}</code>
            </td>
            <td className="p-3">
              {r.entity_type} #{r.entity_id?.slice(0, 8)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
