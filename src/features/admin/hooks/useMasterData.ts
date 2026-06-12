import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export function useMasterData<T extends { id: string }>(table: string, orderCol = 'name') {
  const qc = useQueryClient();
  const key = ['master', table];
  const list = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select('*').order(orderCol);
      if (error) throw new Error(error.message);
      return (data ?? []) as T[];
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: key });
  const upsert = useMutation({
    mutationFn: async (row: Partial<T>) => {
      const { error } = await supabase.from(table).upsert(row);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      refresh();
      toast.success('Data tersimpan');
    },
    onError: (e: any) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      refresh();
      toast.success('Data dihapus');
    },
  });
  return { list, upsert, remove };
}
