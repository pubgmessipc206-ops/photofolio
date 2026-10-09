
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
        return;
      }

      router.replace('/admin');
      router.refresh();
    } catch {
      setErrorMessage('حصل خطأ في الاتصال. حاول مرة تانية.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white"
    >
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-xl space-y-5"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-amber-400">
            PhotoFolio
          </h1>
          <p className="text-slate-300 mt-3">
            تسجيل دخول المدير
          </p>
        </div>

        <div>
          <label htmlFor="email" className="block mb-2 text-sm">
            البريد الإلكتروني
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl bg-slate-800 border border-slate-600 p-3 outline-none focus:border-amber-400"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block mb-2 text-sm">
            كلمة المرور
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl bg-slate-800 border border-slate-600 p-3 outline-none focus:border-amber-400"
            required
          />
        </div>

        {errorMessage && (
          <p role="alert" className="text-red-400 text-sm">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold p-3 disabled:opacity-50"
        >
          {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
        </button>
      </form>
    </main>
  );
}