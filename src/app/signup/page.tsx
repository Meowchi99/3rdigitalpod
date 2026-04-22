'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ActionButton, Field } from '@/components/ui';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { display_name: displayName },
        },
      });
      if (error) {
        setError(error.message);
        return;
      }
      setSuccess(true);
    });
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <div className="mb-4 text-5xl">📧</div>
        <h1 className="mb-3 font-display text-3xl tracking-widest">ตรวจสอบอีเมลของคุณ</h1>
        <p className="text-sm text-muted">
          เราส่งลิงก์ยืนยันไปที่ <span className="text-white">{email}</span> กรุณาคลิกลิงก์เพื่อเริ่มใช้งาน
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="mb-2 font-display text-4xl tracking-widest">✨ สมัครฟรี</h1>
      <p className="mb-8 text-sm text-muted">
        สมัครเพื่อเซฟผลงาน, ติดตามประวัติ, และใช้ฟีเจอร์ทั้งหมดฟรี
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          label="Display Name"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <Field
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Password (6+ chars)"
          type="password"
          minLength={6}
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
          {pending ? '⏳ กำลังสมัคร...' : '🚀 สมัครสมาชิก'}
        </ActionButton>
      </form>

      <div className="mt-6 text-center text-xs text-muted">
        มีบัญชีอยู่แล้ว?{' '}
        <Link href="/login" className="text-brand-blue-3 hover:underline">
          เข้าสู่ระบบ
        </Link>
      </div>
    </div>
  );
}
