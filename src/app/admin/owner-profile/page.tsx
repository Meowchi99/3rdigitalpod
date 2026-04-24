import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { OwnerProfile } from '@/types';
import OwnerForm from './OwnerForm';

export const dynamic = 'force-dynamic';

// Owner-only — admins get bounced to /?unauthorized=1
export default async function AdminOwnerProfilePage() {
  await requireRole(['owner']);
  const supabase = await createClient();
  const { data } = await supabase
    .from('owner_profile')
    .select('*')
    .eq('id', 1)
    .single();

  return <OwnerForm initial={(data as OwnerProfile | null) ?? null} />;
}
