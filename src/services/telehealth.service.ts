import { supabase } from '@/lib/supabase';

export const telehealthService = {
  async appointments(userId: string) {
    const { data, error } = await supabase
      .from('telehealth_appointments')
      .select('*, patients(full_name)')
      .or(`patient_user_id.eq.${userId},clinician_id.eq.${userId}`)
      .order('scheduled_at', { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
  book: (p: { patient_id: string; clinician_id: string; scheduled_at: string; channel: 'video' | 'chat' }) =>
    supabase.from('telehealth_appointments').insert({ ...p, status: 'scheduled' }).select().single(),
  sendMessage: (appointmentId: string, senderId: string, body: string) =>
    supabase.from('telehealth_messages').insert({ appointment_id: appointmentId, sender_id: senderId, body }),
  subscribe(appointmentId: string, onMsg: (m: any) => void) {
    return supabase
      .channel(`tele-${appointmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'telehealth_messages',
          filter: `appointment_id=eq.${appointmentId}`,
        },
        (p) => onMsg(p.new),
      )
      .subscribe();
  },
};
