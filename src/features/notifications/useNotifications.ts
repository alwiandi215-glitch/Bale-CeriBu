import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const { profile } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const unread = items.filter((n) => !n.is_read).length;
  useEffect(() => {
    if (!profile) return;
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => setItems((data ?? []) as AppNotification[]));
    const ch = supabase
      .channel(`notif-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`,
        },
        (p) => setItems((prev) => [p.new as AppNotification, ...prev]),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [profile]);

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };
  const markAllRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', profile!.id)
      .eq('is_read', false);
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };
  return { items, unread, markRead, markAllRead };
}
