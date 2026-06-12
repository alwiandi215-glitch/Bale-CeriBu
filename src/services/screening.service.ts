import { supabase } from '@/lib/supabase';
import type { EpdsAnswers } from '@/features/epds/epds.schema';

export const screeningService = {
  async submit(input: {
    patientId: string;
    phase: 'antenatal' | 'postpartum';
    answers: EpdsAnswers;
    examinerId: string;
  }) {
    const { data: scr, error: e1 } = await supabase
      .from('screenings')
      .insert({
        patient_id: input.patientId,
        phase: input.phase,
        examiner_id: input.examinerId,
        status: 'draft',
      })
      .select()
      .single();
    if (e1) throw new Error(e1.message);

    const rows = Object.entries(input.answers).map(([k, v]) => ({
      screening_id: scr.id,
      question_no: Number(k.slice(1)),
      answer_value: v,
    }));
    const { error: e2 } = await supabase.from('screening_answers').insert(rows);
    if (e2) throw new Error(e2.message);

    const { data: done, error: e3 } = await supabase
      .from('screenings')
      .update({ status: 'submitted' })
      .eq('id', scr.id)
      .select()
      .single();
    if (e3) throw new Error(e3.message);
    return done;
  },

  async history(patientId: string) {
    const { data, error } = await supabase
      .from('screenings')
      .select('id, created_at, total_score, risk_level, phase, status')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  },
};
