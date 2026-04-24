'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signInAction, type AuthState } from './actions';
import { ActionButton, Field } from '@/components/ui';

export default function LoginPage() {
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/';
  const [state, formAction] = useFormState<AuthState, FormData>(
    signInAction,
    null
  );

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="mb-2 font-display text-4xl tracking-widest">🔑 เข้าสู่ระบบ</h1>
      <p className="mb-8 text-sm text-muted">ใช้บัญชีของคุณเพื่อเข้าใช้เครื่องมือและเซฟผลงาน</p>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="redirect" value={redirect} />
        <Field label="Email" type="email" name="email" required />
        <Field label="Password" type="password" name="password" required />
        {state?.error && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-xs text-red-300">
            {state.error}
          </div>
        )}
        <SubmitButton />
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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <ActionButton variant="primary" type="submit" disabled={pending}>
      {pending ? '⏳ กำลังเข้าสู่ระบบ...' : '🔓 เข้าสู่ระบบ'}
    </ActionButton>
  );
}
