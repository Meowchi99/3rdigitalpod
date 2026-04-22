import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Section } from '@/components/ui';
import type { SavedOutput } from '@/types';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function MerchHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Section title="🗃️ MERCH HUB" subtitle="รวม Prompts, Listings, และ Recent Activity ทั้งหมดของคุณ">
        <div className="rounded-2xl border border-white/[0.07] bg-ink-900 p-12 text-center">
          <div className="mb-4 text-5xl">🔐</div>
          <p className="mb-4 text-sm text-muted">ต้องเข้าสู่ระบบเพื่อดู Merch Hub ของคุณ</p>
          <Link
            href="/login?redirect=/merch-hub"
            className="inline-block rounded-lg bg-brand-yellow px-6 py-2 text-sm font-bold text-black hover:bg-brand-yellow-2"
          >
            เข้าสู่ระบบ
          </Link>
        </div>
      </Section>
    );
  }

  const { data: outputs } = await supabase
    .from('saved_outputs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const list = (outputs || []) as SavedOutput[];
  const prompts = list.filter((o) => o.output_type === 'prompt');
  const listings = list.filter((o) => o.output_type === 'listing');
  const analyses = list.filter((o) => o.output_type === 'analysis');

  return (
    <Section title="🗃️ MERCH HUB" subtitle="รวม Prompts, Listings, และ Recent Activity ทั้งหมดของคุณ">
      <div className="grid gap-5 md:grid-cols-3">
        <HubColumn title="💬 Saved Prompts" color="text-brand-red-3" badgeColor="bg-brand-red/15 text-brand-red-3" items={prompts} />
        <HubColumn title="📝 Saved Listings" color="text-brand-blue-3" badgeColor="bg-brand-blue/15 text-brand-blue-3" items={listings} />
        <HubColumn title="🔬 Analyses" color="text-brand-pink" badgeColor="bg-brand-pink/15 text-brand-pink" items={analyses} />
      </div>

      {list.length === 0 && (
        <div className="mt-8 rounded-2xl border border-white/[0.07] bg-ink-900 p-10 text-center text-sm text-muted">
          ยังไม่มีผลงานเซฟไว้ · ลองไปที่{' '}
          <Link href="/research" className="text-brand-blue-3 hover:underline">
            Research &amp; Prompt
          </Link>{' '}
          เพื่อเริ่มสร้าง!
        </div>
      )}
    </Section>
  );
}

function HubColumn({
  title,
  color,
  badgeColor,
  items,
}: {
  title: string;
  color: string;
  badgeColor: string;
  items: SavedOutput[];
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-ink-900">
      <div className="border-b border-white/[0.07] px-4 py-3.5">
        <div className={`text-sm font-bold ${color}`}>{title}</div>
        <div className="mt-0.5 text-xs text-muted">{items.length} รายการ</div>
      </div>
      <div className="p-2">
        {items.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted">ยังไม่มี</div>
        ) : (
          items.slice(0, 10).map((item) => (
            <div
              key={item.id}
              className="mb-2 rounded-lg border border-white/[0.07] bg-ink-800 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${badgeColor}`}>
                  {item.output_type.toUpperCase()}
                </span>
                <span className="text-[10px] text-muted">{formatDate(item.created_at)}</span>
              </div>
              <div className="mt-2 line-clamp-2 text-xs text-muted">
                {item.title ||
                  (typeof item.output_json === 'object' && item.output_json && 'prompt' in item.output_json
                    ? String((item.output_json as Record<string, unknown>).prompt).slice(0, 120)
                    : JSON.stringify(item.output_json).slice(0, 120))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
