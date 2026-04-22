'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ActionButton, Field } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        return;
      }
      router.push(redirect);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="mb-2 font-display text-4xl tracking-widest">🔑 เข้าสู่ระบบ</h1>
      <p className="mb-8 text-sm text-muted">ใช้บัญชีของคุณเพื่อเข้าใช้เครื่องมือและเซฟผลงาน</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-xs text-red-300">
            {error}
          </div>
        )}
        <ActionButton variant="primary" disabled={pending}>
          {pending ? '⏳ กำลังเข้าสู่ระบบ...' : '🔓 เข้าสู่ระบบ'}
        </ActionButton>
      </form>

      <div className="mt-6 text-center text-xs text-muted">
        ยังไม่มีบัญชี?{' '}
        <Link href="/signup" className="text-brand-blue-3 hover:underline">
          สมัครสมาชิกฟรี
        </Link>
      </div>
    </div>
  );
}
