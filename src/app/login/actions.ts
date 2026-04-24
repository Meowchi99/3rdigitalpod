'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export type AuthState = { error: string | null } | null;

/**
 * Server Action สำหรับล็อกอิน
 * ทำงานฝั่ง server → cookies ถูก set ใน HTTP response headers โดยตรง
 */
export async function signInAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const redirectTo = String(formData.get('redirect') || '/') || '/';

  if (!email || !password) {
    return { error: 'กรุณากรอกอีเมลและรหัสผ่าน' };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('invalid login credentials')) {
        return { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
      }
      if (msg.includes('email not confirmed')) {
        return { error: 'อีเมลยังไม่ถูกยืนยัน' };
      }
      return { error: error.message };
    }

    revalidatePath('/', 'layout');
  } catch (e) {
    // ⚠️ redirect() throws ข้างใน — ต้องเช็คว่าเป็น NEXT_REDIRECT หรือไม่
    if (e instanceof Error && e.message === 'NEXT_REDIRECT') throw e;
    return { error: 'เกิดข้อผิดพลาด: ' + (e instanceof Error ? e.message : 'unknown') };
  }

  redirect(redirectTo);
}
