import { supabase } from '@/lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';

export class BaseRepository<Row extends { id: string | number }> {
  constructor(protected table: string) {}

  protected unwrap<T>(data: T | null, error: PostgrestError | null): T {
    if (error) throw new Error(error.message);
    return data as T;
  }

  async list(opts: { page?: number; size?: number; search?: string; searchCol?: string } = {}) {
    const { page = 1, size = 20, search, searchCol = 'full_name' } = opts;
    let q = supabase.from(this.table).select('*', { count: 'exact' });
    if (search) q = q.ilike(searchCol, `%${search}%`);
    const from = (page - 1) * size;
    const { data, error, count } = await q
      .range(from, from + size - 1)
      .order('created_at', { ascending: false });
    return { rows: this.unwrap(data, error) as Row[], total: count ?? 0 };
  }

  async byId(id: Row['id']) {
    const { data, error } = await supabase.from(this.table).select('*').eq('id', id).single();
    return this.unwrap(data, error) as Row;
  }

  async create(payload: Partial<Row>) {
    const { data, error } = await supabase.from(this.table).insert(payload).select().single();
    return this.unwrap(data, error) as Row;
  }

  async update(id: Row['id'], payload: Partial<Row>) {
    const { data, error } = await supabase
      .from(this.table)
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    return this.unwrap(data, error) as Row;
  }

  async remove(id: Row['id']) {
    const { error } = await supabase.from(this.table).delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}
