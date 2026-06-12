import { supabase } from '@/lib/supabase';

export interface Intervention {
  id: string;
  patient_id: string;
  screening_id: string | null;
  type_id: string;
  notes: string;
  status: 'planned' | 'ongoing' | 'done' | 'cancelled';
  performed_by: string;
  performed_at: string | null;
  created_at: string;
}

export const interventionService = {
  async listByPatient(patientId: string) {
    const { data, error } = await supabase
      .from('interventions')
      .select('*, intervention_types(name, category)')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
  create: (p: Partial<Intervention>) =>
    supabase.from('interventions').insert(p).select().single(),
  updateStatus: (id: string, status: Intervention['status']) =>
    supabase
      .from('interventions')
      .update({ status, performed_at: status === 'done' ? new Date().toISOString() : null })
      .eq('id', id),
};
