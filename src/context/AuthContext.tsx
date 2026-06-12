import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  fullName: string;
  role:
    | 'super_admin'
    | 'administrator'
    | 'kapus'
    | 'dokter'
    | 'psikolog'
    | 'bidan'
    | 'pasien'
    | string;
  puskesmasId: string | null;
  puskesmasName?: string | null;
  phone?: string | null;
  email?: string | null;
}

interface AuthContextValue {
  profile: Profile | null;
  authUserId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  profile: null,
  authUserId: null,
  loading: true,
  signOut: async () => {},
});

function mapProfile(row: any): Profile {
  return {
    id: row.id,
    fullName: row.full_name ?? '',
    role: row.role ?? 'pasien',
    puskesmasId: row.puskesmas_id ?? null,
    puskesmasName: row.puskesmas?.name ?? null,
    phone: row.phone ?? null,
    email: row.email ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: auth } = await supabase.auth.getUser();
      if (!active) return;
      if (!auth.user) {
        setAuthUserId(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      setAuthUserId(auth.user.id);
      const { data } = await supabase
        .from('profiles')
        .select('*, puskesmas(name)')
        .eq('id', auth.user.id)
        .single();
      if (!active) return;
      setProfile(data ? mapProfile(data) : null);
      setLoading(false);
    }
    void load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => void load());
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      profile,
      authUserId,
      loading,
      signOut: async () => {
        await supabase.auth.signOut();
        setProfile(null);
        setAuthUserId(null);
      },
    }),
    [profile, authUserId, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
