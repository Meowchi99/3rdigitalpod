import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { Section } from '@/components/ui';
import type { OwnerProfile } from '@/types';

export const dynamic = 'force-dynamic';

export default async function OwnerPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('owner_profile')
    .select('*')
    .eq('id', 1)
    .single();
  const owner = data as OwnerProfile | null;

  const profile = await getCurrentProfile();
  const canEdit = profile?.role === 'owner';

  return (
    <Section title="👤 OWNER" subtitle="เจ้าของและผู้พัฒนา 3R Digital POD">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* ─── Hero: avatar + name + intro ─── */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-900">
          <div className="flex flex-col items-center gap-6 p-8 sm:flex-row sm:items-start">
            <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-brand-red/20 via-ink-800 to-brand-blue/20">
              {owner?.profile_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={owner.profile_image_url}
                  alt={owner.owner_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-5xl">
                  👤
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="font-display text-4xl tracking-widest">
                {owner?.owner_name || 'Owner'}
              </h1>
              <div className="mt-1 font-mono text-xs text-brand-pink">
                // 3R Digital POD · Owner
              </div>
              {owner?.intro && (
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {owner.intro}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ─── Revenue Section ─── */}
        {(owner?.total_revenue !== null ||
          owner?.monthly_revenue !== null ||
          owner?.revenue_note) && (
          <div className="overflow-hidden rounded-2xl border border-brand-yellow/20 bg-gradient-to-br from-ink-900 via-ink-900 to-[#1a1200] p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-brand-yellow">
                  💰 Revenue
                </div>
                <div className="mt-0.5 text-[11px] text-muted">
                  ผลจากการทำ Print on Demand
                </div>
              </div>
              {owner?.revenue_note && (
                <span className="rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-3 py-1 text-[10px] font-mono text-brand-yellow">
                  {owner.revenue_note}
                </span>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <RevenueCard
                label="Total Revenue"
                value={owner?.total_revenue}
                color="text-brand-yellow"
                icon="💎"
              />
              <RevenueCard
                label="Monthly Revenue"
                value={owner?.monthly_revenue}
                color="text-brand-pink"
                icon="📈"
              />
            </div>
          </div>
        )}

        {/* ─── Story Section ─── */}
        {(owner?.story || owner?.story_image_url) && (
          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-900">
            <div className="border-b border-white/[0.07] px-6 py-4">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-blue-3">
                📖 Story / Background
              </div>
            </div>

            {owner?.story_image_url && (
              <div className="aspect-[16/9] w-full overflow-hidden bg-ink-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={owner.story_image_url}
                  alt="Owner story"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {owner?.story && (
              <div className="whitespace-pre-wrap px-6 py-6 text-sm leading-relaxed text-muted">
                {owner.story}
              </div>
            )}
          </div>
        )}

        {/* ─── Edit CTA (owner only) ─── */}
        {canEdit && (
          <div className="text-center">
            <Link
              href="/admin/owner-profile"
              className="inline-flex items-center gap-2 rounded-lg border border-brand-yellow/30 bg-brand-yellow/10 px-5 py-2.5 text-sm font-bold text-brand-yellow hover:bg-brand-yellow/20"
            >
              ✏️ Edit Owner Profile
            </Link>
          </div>
        )}
      </div>
    </Section>
  );
}

function RevenueCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number | null | undefined;
  color: string;
  icon: string;
}) {
  const display =
    value !== null && value !== undefined
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(Number(value))
      : '—';

  return (
    <div className="rounded-xl border border-white/[0.07] bg-ink-800 p-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className={`mt-2 font-display text-3xl tracking-widest ${color}`}>
        {display}
      </div>
    </div>
  );
}
