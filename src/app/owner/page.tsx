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
  const canEdit = profile?.role === 'owner' || profile?.role === 'admin';

  return (
    <Section title="👤 OWNER" subtitle="เจ้าของและผู้พัฒนา 3R Digital POD">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-900">
          {/* Banner */}
          <div
            className="relative flex h-40 items-end bg-gradient-to-br from-[#0d0010] via-ink-800 to-[#00081a] px-6 pb-4"
            style={
              owner?.banner_url
                ? { backgroundImage: `url(${owner.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : undefined
            }
          >
            <div className="absolute bottom-4 right-6 font-display text-5xl tracking-widest opacity-10">3RPOD</div>
          </div>

          <div className="px-6 pb-8 pt-4">
            <div className="mb-4 flex items-start gap-4">
              <div className="-mt-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-ink-900 bg-gradient-to-br from-brand-red to-brand-pink text-3xl">
                {owner?.avatar_url ? (
                  <img src={owner.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  '👨‍💻'
                )}
              </div>
              <div className="pt-2">
                <div className="text-xl font-bold">{owner?.display_name || '3R Digital Lab'}</div>
                <div className="font-mono text-xs text-brand-pink">// {owner?.role_title || 'POD Creator'}</div>
              </div>
            </div>

            <p className="mb-4 text-sm leading-relaxed text-muted">
              {owner?.intro || 'สร้าง 3R Digital POD เพื่อรวมทุก workflow ของ Print on Demand ไว้ในที่เดียว'}
            </p>

            {owner?.story && (
              <div className="mb-4 rounded-lg bg-ink-800 p-4 text-xs leading-relaxed text-muted">
                <div className="mb-1 font-bold text-white">📖 Story</div>
                {owner.story}
              </div>
            )}

            {/* Socials */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(owner?.social_links || {}).map(
                ([k, v]) =>
                  v && (
                    <a
                      key={k}
                      href={v as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-md border border-white/[0.07] bg-ink-800 px-3.5 py-1.5 text-xs text-muted hover:text-white"
                    >
                      <span className="capitalize">{k}</span>
                    </a>
                  )
              )}
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="mt-5 text-center">
            <Link
              href="/admin/owner-profile"
              className="inline-flex items-center gap-2 rounded-lg border border-brand-yellow/30 bg-brand-yellow/10 px-5 py-2 text-sm font-bold text-brand-yellow hover:bg-brand-yellow/20"
            >
              ✏️ Edit Owner Profile (Admin)
            </Link>
          </div>
        )}
      </div>
    </Section>
  );
}
