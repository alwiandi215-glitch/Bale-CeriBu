import { useState } from 'react';
import { useMasterData } from '../hooks/useMasterData';

export function MasterTable({
  table,
  columns,
}: {
  table: string;
  columns: { key: string; label: string }[];
}) {
  const { list, upsert, remove } = useMasterData(table);
  const [draft, setDraft] = useState<Record<string, string>>({});

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {columns.map((c) => (
          <input
            key={c.key}
            placeholder={c.label}
            value={draft[c.key] ?? ''}
            onChange={(e) => setDraft({ ...draft, [c.key]: e.target.value })}
            className="rounded-lg border px-3 py-1.5 text-sm"
          />
        ))}
        <button
          onClick={() => {
            upsert.mutate(draft as any);
            setDraft({});
          }}
          className="rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-sm"
        >
          Tambah
        </button>
      </div>
      <table className="w-full text-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow">
        <thead className="bg-slate-50 dark:bg-slate-700 text-left">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="p-3">
                {c.label}
              </th>
            ))}
            <th className="p-3" />
          </tr>
        </thead>
        <tbody>
          {(list.data ?? []).map((row: any) => (
            <tr key={row.id} className="border-t">
              {columns.map((c) => (
                <td key={c.key} className="p-3">
                  {row[c.key]}
                </td>
              ))}
              <td className="p-3 text-right">
                <button onClick={() => remove.mutate(row.id)} className="text-red-500 text-sm">
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Contoh pemakaian:
// <MasterTable table="regions" columns={[{ key: 'name', label: 'Nama Wilayah' }, { key: 'code', label: 'Kode' }]} />
// <MasterTable table="puskesmas" columns={[{ key: 'name', label: 'Nama Puskesmas' }, { key: 'address', label: 'Alamat' }]} />
// <MasterTable table="intervention_types" columns={[{ key: 'name', label: 'Jenis Intervensi' }, { key: 'category', label: 'Kategori' }]} />
// <MasterTable table="education_categories" columns={[{ key: 'name', label: 'Kategori Edukasi' }]} />
