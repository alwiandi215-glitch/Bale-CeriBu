import { supabase } from '@/lib/supabase';

export interface ReportFilter {
  puskesmasId?: string;
  from: string;
  to: string;
  phase?: 'antenatal' | 'postpartum';
}

export const reportService = {
  async screeningRecap(f: ReportFilter) {
    let q = supabase
      .from('screenings')
      .select('id, created_at, total_score, risk_level, phase, patients(full_name, no_rm)')
      .gte('created_at', f.from)
      .lte('created_at', f.to)
      .eq('status', 'submitted');
    if (f.puskesmasId) q = q.eq('puskesmas_id', f.puskesmasId);
    if (f.phase) q = q.eq('phase', f.phase);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  summarize(rows: Array<{ risk_level: string }>) {
    return rows.reduce(
      (acc, r) => {
        acc.total++;
        acc[r.risk_level as 'rendah' | 'sedang' | 'tinggi']++;
        return acc;
      },
      { total: 0, rendah: 0, sedang: 0, tinggi: 0 },
    );
  },
};
