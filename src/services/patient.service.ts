import { BaseRepository } from './base.repository';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type Patient = Database['public']['Tables']['patients']['Row'];

class PatientRepository extends BaseRepository<Patient> {
  constructor() {
    super('patients');
  }
  async timeline(patientId: string) {
    const { data, error } = await supabase
      .from('patient_timeline')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  }
}

export const patientRepo = new PatientRepository();

export const patientService = {
  list: patientRepo.list.bind(patientRepo),
  byId: patientRepo.byId.bind(patientRepo),
  timeline: patientRepo.timeline.bind(patientRepo),
  create: (p: Partial<Patient>) => patientRepo.create(p),
  update: (id: string, p: Partial<Patient>) => patientRepo.update(id, p),
  remove: (id: string) => patientRepo.remove(id),
  async uploadPhoto(patientId: string, file: File) {
    const path = `${patientId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('patient-files').upload(path, file);
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from('patient-files').getPublicUrl(path);
    return data.publicUrl;
  },
};
