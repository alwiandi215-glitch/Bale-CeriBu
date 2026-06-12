import { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success('Berhasil masuk');
  }

  return (
    <div className="min-h-full grid place-items-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-lg"
      >
        <div className="text-center space-y-1">
          <div className="mx-auto size-12 grid place-items-center rounded-2xl bg-emerald-600 text-white text-xl font-bold">
            B
          </div>
          <h1 className="text-xl font-bold">BALE CERI_BU</h1>
          <p className="text-sm text-slate-500">Sistem Skrining Kesehatan Jiwa Ibu</p>
        </div>

        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-xl border px-3 py-2 dark:bg-slate-700"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-xl border px-3 py-2 dark:bg-slate-700"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-600 text-white px-4 py-2.5 disabled:opacity-50"
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </button>

        <p className="text-center text-xs text-slate-400">
          Belum punya akun? Hubungi administrator puskesmas Anda.
        </p>
      </form>
    </div>
  );
}
