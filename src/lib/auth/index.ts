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
  return data as Profile | null;
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
