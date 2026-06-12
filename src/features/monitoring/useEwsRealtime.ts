import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export interface EwsAlert {
  id: string;
  patient_id: string;
  screening_id: string;
  level: 'sedang' | 'tinggi';
  reason: string;
  status: 'open' | 'ack' | 'closed';
  created_at: string;
}

export function useEwsRealtime() {
  const { profile } = useAuth();
  const [alerts, setAlerts] = useState<EwsAlert[]>([]);
  useEffect(() => {
    if (!profile) return;
    supabase
      .from('ews_alerts')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .then(({ data }) => setAlerts((data ?? []) as EwsAlert[]));
    const channel = supabase
      .channel('ews-monitor')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ews_alerts' },
        (payload) => {
          const a = payload.new as EwsAlert;
          setAlerts((prev) => [a, ...prev]);
          if (a.level === 'tinggi')
            toast.error(`Alert RISIKO TINGGI baru: ${a.reason}`, { duration: 8000 });
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'ews_alerts' },
        (payload) => {
          const a = payload.new as EwsAlert;
          setAlerts((prev) => prev.filter((x) => (a.status === 'open' ? true : x.id !== a.id)));
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [profile]);

  const acknowledge = async (id: string) => {
    await supabase.from('ews_alerts').update({ status: 'ack', ack_by: profile!.id }).eq('id', id);
  };
  return { alerts, acknowledge };
}
