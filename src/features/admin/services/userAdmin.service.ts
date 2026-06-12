import { supabase } from '@/lib/supabase';

export const userAdminService = {
  async list(filter: { puskesmasId?: string; role?: string; search?: string }) {
    let q = supabase.from('profiles').select('*, puskesmas(name)');
    if (filter.puskesmasId) q = q.eq('puskesmas_id', filter.puskesmasId);
    if (filter.role) q = q.eq('role', filter.role);
    if (filter.search) q = q.ilike('full_name', `%${filter.search}%`);
    const { data, error } = await q.order('full_name');
    if (error) throw new Error(error.message);
    return data ?? [];
  },
  async invite(payload: { email: string; role: string; puskesmas_id: string; full_name: string }) {
    const { data, error } = await supabase.functions.invoke('admin-create-user', { body: payload });
    if (error) throw new Error(error.message);
    return data;
  },
  setActive: (id: string, active: boolean) =>
    supabase.from('profiles').update({ is_active: active }).eq('id', id),
  changeRole: (id: string, role: string) =>
    supabase.from('profiles').update({ role }).eq('id', id),
};
