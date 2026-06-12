import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '@/services/patient.service';
import toast from 'react-hot-toast';

export function usePatients(page: number, search: string) {
  return useQuery({
    queryKey: ['patients', page, search],
    queryFn: () => patientService.list({ page, search }),
    placeholderData: (prev) => prev,
  });
}

export function usePatientMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['patients'] });
  return {
    create: useMutation({
      mutationFn: patientService.create,
      onSuccess: () => {
        invalidate();
        toast.success('Pasien ditambahkan');
      },
    }),
    update: useMutation({
      mutationFn: ({ id, data }: any) => patientService.update(id, data),
      onSuccess: () => {
        invalidate();
        toast.success('Pasien diperbarui');
      },
    }),
    remove: useMutation({
      mutationFn: patientService.remove,
      onSuccess: () => {
        invalidate();
        toast.success('Pasien dihapus');
      },
    }),
  };
}
