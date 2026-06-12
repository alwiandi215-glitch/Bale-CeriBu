import { supabase } from '@/lib/supabase';

export interface Referral {
  id: string;
  patient_id: string;
  screening_id: string | null;
  from_puskesmas: string;
  to_facility: string;
  reason: string;
  urgency: 'rutin' | 'segera' | 'darurat';
  status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'rejected';
  created_at: string;
}

export const referralService = {
  async listByPatient(patientId: string) {
    const { data, error } = await supabase
      .from('referrals')
      .select('*, referral_tracking(status, note, created_at)')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
  create: (p: Partial<Referral>) => supabase.from('referrals').insert(p).select().single(),
  advance: (id: string, status: Referral['status'], note?: string) =>
    supabase
      .from('referrals')
      .update({ status })
      .eq('id', id)
      .then(async () => {
        await supabase.from('referral_tracking').insert({ referral_id: id, status, note });
      }),
};
