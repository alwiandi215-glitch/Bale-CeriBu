import { supabase } from '@/lib/supabase';

export const auditService = {
  async list(opts: { page?: number; size?: number; action?: string; userId?: string } = {}) {
    const { page = 1, size = 30, action, userId } = opts;
    let q = supabase.from('audit_logs').select('*, profiles(full_name)', { count: 'exact' });
    if (action) q = q.eq('action', action);
    if (userId) q = q.eq('actor_id', userId);
    const from = (page - 1) * size;
    const { data, error, count } = await q
      .range(from, from + size - 1)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return { rows: data ?? [], total: count ?? 0 };
  },
};
