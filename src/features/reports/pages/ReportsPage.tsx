import { useState } from 'react';
import { reportService } from '@/services/report.service';
import { exportScreeningPdf } from '@/lib/pdf';
import { exportToExcel } from '@/lib/excel';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const { profile } = useAuth();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  async function generate(kind: 'pdf' | 'excel' | 'print') {
    if (!from || !to) return toast.error('Pilih periode terlebih dahulu');
    const rows = await reportService.screeningRecap({
      from,
      to,
      puskesmasId: profile?.role === 'super_admin' ? undefined : profile?.puskesmasId ?? undefined,
    });
    const summary = reportService.summarize(rows as any);
    const meta = {
      title: 'Laporan Skrining EPDS',
      period: `${from} s/d ${to}`,
      puskesmas: profile?.puskesmasName ?? 'Semua',
      summary,
      rows,
    };
    if (kind === 'pdf') exportScreeningPdf(meta);
    else if (kind === 'excel') exportToExcel(rows as any[], 'laporan-skrining');
    else window.print();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Laporan</h1>
      <div className="flex flex-wrap gap-3 items-end">
        <label className="text-sm">
          Dari
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="block rounded-xl border px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Sampai
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="block rounded-xl border px-3 py-2"
          />
        </label>
        <button onClick={() => generate('pdf')} className="rounded-xl bg-emerald-600 text-white px-4 py-2">
          Export PDF
        </button>
        <button onClick={() => generate('excel')} className="rounded-xl border px-4 py-2">
          Export Excel
        </button>
        <button onClick={() => generate('print')} className="rounded-xl border px-4 py-2">
          Cetak
        </button>
      </div>
    </div>
  );
}
