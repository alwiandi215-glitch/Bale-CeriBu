import { supabase } from '@/lib/supabase';

export const educationService = {
  async list(categoryId?: string, search?: string) {
    let q = supabase
      .from('education_contents')
      .select('*, education_categories(name)')
      .eq('is_published', true);
    if (categoryId) q = q.eq('category_id', categoryId);
    if (search) q = q.ilike('title', `%${search}%`);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
  byId: (id: string) => supabase.from('education_contents').select('*').eq('id', id).single(),
  toggleBookmark: (userId: string, contentId: string, on: boolean) =>
    on
      ? supabase.from('bookmarks').insert({ user_id: userId, content_id: contentId })
      : supabase.from('bookmarks').delete().match({ user_id: userId, content_id: contentId }),
};
