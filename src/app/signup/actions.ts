'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

export type SignupState = {
  error: string | null;
  success: boolean;
  needsConfirm: boolean;
  email: string | null;
} | null;

export async function signUpAction(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const displayName = String(formData.get('displayName') || '').trim();

  if (!email || !password || !displayName) {
    return {
      error: 'กรุณากรอกข้อมูลให้ครบ',
      success: false,
      needsConfirm: false,
      email: null,
    };
  }
  if (password.length < 6) {
    return {
      error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
      success: false,
      needsConfirm: false,
      email: null,
    };
  }

  const h = await headers();
  const origin =
    h.get('origin') ||
    (h.get('host') ? `https://${h.get('host')}` : 'http://localhost:3000');

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: { display_name: displayName },
    },
  });

  if (error) {
    return {
      error: error.message,
      success: false,
      needsConfirm: false,
      email: null,
    };
  }

  // ถ้ามี session ทันที (Supabase config ปิด email confirmation) → login สำเร็จเลย
  if (data.session) {
    revalidatePath('/', 'layout');
    redirect('/');
  }

  // ถ้ายังไม่มี session → รอยืนยันอีเมล
  return {
    error: null,
    success: true,
    needsConfirm: true,
    email,
  };
}
