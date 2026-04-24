'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { signUpAction, type SignupState } from './actions';
import { ActionButton, Field } from '@/components/ui';

export default function SignupPage() {
  const [state, formAction] = useFormState<SignupState, FormData>(
    signUpAction,
    null
  );

  if (state?.success && state.needsConfirm) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <div className="mb-4 text-5xl">📧</div>
        <h1 className="mb-3 font-display text-3xl tracking-widest">
          ตรวจสอบอีเมลของคุณ
        </h1>
        <p className="text-sm text-muted">
          เราส่งลิงก์ยืนยันไปที่{' '}
          <span className="text-white">{state.email}</span>{' '}
          กรุณาคลิกลิงก์เพื่อเริ่มใช้งาน
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

      <form action={formAction} className="flex flex-col gap-4">
        <Field label="Display Name" name="displayName" required />
        <Field label="Email" type="email" name="email" required />
        <Field
          label="Password (6+ chars)"
          type="password"
          name="password"
          minLength={6}
          required
        />
        {state?.error && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-xs text-red-300">
            {state.error}
          </div>
        )}
        <SubmitButton />
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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <ActionButton variant="primary" type="submit" disabled={pending}>
      {pending ? '⏳ กำลังสมัคร...' : '🚀 สมัครสมาชิก'}
    </ActionButton>
  );
}
