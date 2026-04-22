import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import type { UserRole } from '@/types';

const VALID_ROLES: UserRole[] = ['user', 'admin', 'owner'];

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify caller is owner
    const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!me || me.role !== 'owner') {
      return NextResponse.json({ error: 'Owner role required' }, { status: 403 });
    }

    const { user_id, role } = await request.json();
    if (!user_id || !role || !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Owner cannot demote themselves through this endpoint
    if (user_id === user.id) {
      return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
    }

    // Use service role to bypass RLS for the role change
    const admin = createServiceRoleClient();
    const { error } = await admin.from('profiles').update({ role }).eq('id', user_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
