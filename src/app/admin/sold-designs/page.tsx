import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { SoldDesign } from '@/types';
import SoldDesignsManager from './SoldDesignsManager';

export const dynamic = 'force-dynamic';

// Owner-only (admins blocked)
export default async function AdminSoldDesignsPage() {
  await requireRole(['owner']);
  const supabase = await createClient();
  const { data } = await supabase
    .from('sold_designs')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  return <SoldDesignsManager initial={(data as SoldDesign[] | null) ?? []} />;
}
