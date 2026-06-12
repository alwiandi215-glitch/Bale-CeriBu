import { supabase } from '@/lib/supabase';

export interface DashboardSummary {
  total_pasien: number;
  high_risk: number;
  total_skrining: number;
  alert_aktif: number;
}

export interface MonthlyRow {
  bulan: string;
  total: number;
  rendah: number;
  sedang: number;
  tinggi: number;
}

export const dashboardService = {
  async summary(puskesmasId: string | null): Promise<DashboardSummary> {
    let q = supabase.from('v_dashboard_summary').select('*');
    if (puskesmasId) q = q.eq('puskesmas_id', puskesmasId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []).reduce<DashboardSummary>(
      (a, r: any) => ({
        total_pasien: a.total_pasien + (r.total_pasien ?? 0),
        high_risk: a.high_risk + (r.high_risk ?? 0),
        total_skrining: a.total_skrining + (r.total_skrining ?? 0),
        alert_aktif: a.alert_aktif + (r.alert_aktif ?? 0),
      }),
      { total_pasien: 0, high_risk: 0, total_skrining: 0, alert_aktif: 0 },
    );
  },

  async monthly(puskesmasId: string | null, year: number): Promise<MonthlyRow[]> {
    let q = supabase
      .from('v_screening_monthly')
      .select('*')
      .gte('bulan', `${year}-01-01`)
      .lte('bulan', `${year}-12-31`);
    if (puskesmasId) q = q.eq('puskesmas_id', puskesmasId);
    const { data, error } = await q.order('bulan');
    if (error) throw new Error(error.message);
    return (data ?? []) as MonthlyRow[];
  },
};
