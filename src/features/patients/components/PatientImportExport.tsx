import { z } from 'zod';
import toast from 'react-hot-toast';
import { parseExcel, exportToExcel } from '@/lib/excel';
import { patientService } from '@/services/patient.service';
import { useAuth } from '@/context/AuthContext';

const rowSchema = z.object({
  full_name: z.string().min(2),
  nik: z.string().optional(),
  no_rm: z.string().optional(),
  phone: z.string().optional(),
});

export function PatientImportExport() {
  const { profile } = useAuth();
  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const raw = await parseExcel(file);
    let ok = 0,
      fail = 0;
    for (const r of raw) {
      const parsed = rowSchema.safeParse(r);
      if (!parsed.success) {
        fail++;
        continue;
      }
      await patientService.create({ ...parsed.data, puskesmas_id: profile!.puskesmasId! } as any);
      ok++;
    }
    toast.success(`Import selesai: ${ok} sukses, ${fail} gagal`);
  }
  return (
    <div className="flex gap-2">
      <label className="rounded-xl border px-3 py-2 cursor-pointer text-sm">
        Import Excel
        <input type="file" accept=".xlsx,.xls" hidden onChange={handleImport} />
      </label>
      <button
        onClick={async () => exportToExcel((await patientService.list({ size: 1000 })).rows, 'pasien')}
        className="rounded-xl bg-emerald-600 text-white px-3 py-2 text-sm"
      >
        Export Excel
      </button>
    </div>
  );
}
