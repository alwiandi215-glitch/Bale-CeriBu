import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { profile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { register, handleSubmit } = useForm({
    defaultValues: { full_name: profile?.fullName, phone: profile?.phone },
  });
  const pwForm = useForm({ defaultValues: { password: '' } });

  async function saveProfile(v: any) {
    const { error } = await supabase.from('profiles').update(v).eq('id', profile!.id);
    toast[error ? 'error' : 'success'](error ? error.message : 'Profil diperbarui');
  }
  async function changePassword(v: { password: string }) {
    const { error } = await supabase.auth.updateUser({ password: v.password });
    toast[error ? 'error' : 'success'](error ? error.message : 'Password diubah');
  }

  return (
    <div className="max-w-xl space-y-8">
      <section>
        <h2 className="font-semibold mb-3">Profil</h2>
        <form onSubmit={handleSubmit(saveProfile)} className="space-y-3">
          <input {...register('full_name')} className="w-full rounded-xl border px-3 py-2" placeholder="Nama lengkap" />
          <input {...register('phone')} className="w-full rounded-xl border px-3 py-2" placeholder="No. HP" />
          <button className="rounded-xl bg-emerald-600 text-white px-4 py-2">Simpan Profil</button>
        </form>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Ubah Password</h2>
        <form onSubmit={pwForm.handleSubmit(changePassword)} className="space-y-3">
          <input
            type="password"
            {...pwForm.register('password')}
            className="w-full rounded-xl border px-3 py-2"
            placeholder="Password baru"
          />
          <button className="rounded-xl border px-4 py-2">Ubah Password</button>
        </form>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Tema</h2>
        <div className="flex gap-2">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`rounded-xl border px-4 py-2 capitalize ${theme === t ? 'border-emerald-500 text-emerald-600' : ''}`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
