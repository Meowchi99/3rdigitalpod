import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Profile, UserRole } from '@/types';

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (data) return data as Profile;

  // ─── Fallback: ถ้า user มีแต่ profile ไม่มี (trigger handle_new_user ไม่ทำงาน) ───
  // สร้าง profile ให้อัตโนมัติเพื่อป้องกัน TopNav ไม่แสดงสถานะล็อกอิน
  const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();
  const isFirstOwner =
    ownerEmail && user.email?.toLowerCase() === ownerEmail;

  // เช็คว่ามี owner แล้วหรือยัง — ถ้ายังไม่มีเลย user แรกที่ login = owner
  const { count: ownerCount } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'owner');

  const assignedRole: UserRole =
    isFirstOwner || (ownerCount ?? 0) === 0 ? 'owner' : 'user';

  const displayName =
    (user.user_metadata?.display_name as string | undefined) ||
    user.email?.split('@')[0] ||
    'User';

  const { data: inserted } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      email: user.email ?? '',
      role: assignedRole,
      display_name: displayName,
    })
    .select('*')
    .single();

  return (inserted as Profile | null) ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireRole(roles: UserRole[]): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login');
  if (!roles.includes(profile.role)) redirect('/?unauthorized=1');
  return profile;
}

export function isAdminOrOwner(role: UserRole | null | undefined): boolean {
  return role === 'owner' || role === 'admin';
}
