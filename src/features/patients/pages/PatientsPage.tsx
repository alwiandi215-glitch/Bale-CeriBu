import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { usePatients } from '../hooks/usePatients';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { RiskBadge } from '@/components/common/RiskBadge';
import { PatientImportExport } from '../components/PatientImportExport';

export default function PatientsPage() {
  const [page, setPage] = useState(1);
  const [term, setTerm] = useState('');
  const search = useDebounce(term, 400);
  const { data, isLoading } = usePatients(page, search);

  return (
    <div className="space-y-4">
      <PageHeader title="Manajemen Pasien" action={<PatientImportExport />} />

      <input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Cari nama pasien..."
        className="w-full max-w-sm rounded-xl border px-3 py-2"
      />

      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : data && data.rows.length === 0 ? (
        <EmptyState title="Belum ada pasien" />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-800 shadow">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700 text-left">
              <tr>
                <th className="p-3">No. RM</th>
                <th className="p-3">Nama</th>
                <th className="p-3">Status</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data?.rows.map((p: any) => (
                <tr key={p.id} className="border-t hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="p-3">{p.no_rm ?? '-'}</td>
                  <td className="p-3 font-medium">{p.full_name}</td>
                  <td className="p-3">
                    <RiskBadge status={p.status} />
                  </td>
                  <td className="p-3">
                    <Link to={`/patients/${p.id}`} className="text-emerald-600">
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.total > 20 && (
        <div className="flex justify-end gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border px-3 py-1 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-2 py-1">Hal {page}</span>
          <button
            disabled={page * 20 >= data.total}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border px-3 py-1 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
