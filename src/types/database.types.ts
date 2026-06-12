// Stub tipe database. Ganti dengan hasil generate Supabase:
//   npx supabase gen types typescript --project-id <ref> > src/types/database.types.ts

export interface PatientRow {
  id: string;
  full_name: string;
  nik?: string | null;
  no_rm?: string | null;
  phone?: string | null;
  status?: 'rendah' | 'sedang' | 'tinggi' | string | null;
  puskesmas_id?: string | null;
  photo_url?: string | null;
  age?: number | null;
  gestational_week?: number | null;
  has_prev_depression?: boolean | null;
  created_at?: string;
  [key: string]: unknown;
}

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: PatientRow;
        Insert: Partial<PatientRow>;
        Update: Partial<PatientRow>;
      };
      [key: string]: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
    };
    Views: { [key: string]: { Row: Record<string, any> } };
    Functions: { [key: string]: { Args: Record<string, any>; Returns: any } };
    Enums: { [key: string]: string };
  };
}
