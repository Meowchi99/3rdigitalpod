import { createClient } from '@/lib/supabase/server';
import { Section } from '@/components/ui';
import type { Trend } from '@/types';

export const dynamic = 'force-dynamic';

export default async function TrendingPage() {
  const supabase = await createClient();
  const [{ data: daily }, { data: monthly }] = await Promise.all([
    supabase.from('trends').select('*').eq('trend_type', 'daily').order('score', { ascending: false }).limit(20),
    supabase.from('trends').select('*').eq('trend_type', 'monthly').order('score', { ascending: false }).limit(20),
  ]);

  return (
    <Section title="🔥 TRENDING" subtitle="เทรนด์ที่กำลังร้อนแรงในแต่ละ Niche">
      <div className="grid gap-5 md:grid-cols-2">
        <TrendList title="🔥 Daily Trends" tag="TODAY" tagClr="bg-brand-red/15 text-brand-red-3" items={(daily || []) as Trend[]} />
        <TrendList title="📅 Monthly Trends" tag="THIS MONTH" tagClr="bg-brand-blue/15 text-brand-blue-3" items={(monthly || []) as Trend[]} />
      </div>
    </Section>
  );
}

function TrendList({ title, tag, tagClr, items }: { title: string; tag: string; tagClr: string; items: Trend[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-ink-900">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3.5">
        <div className="flex items-center gap-2 text-sm font-bold">
          <span>{title}</span>
          <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${tagClr}`}>{tag}</span>
        </div>
      </div>
      <div className="p-2">
        {items.map((t, i) => {
          const heat = Math.min(5, Math.max(1, Math.round(t.score / 20)));
          return (
            <div key={t.id} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-ink-800">
              <span className="w-5 text-right font-mono text-xs text-muted">{i + 1}</span>
              <span className="flex-1 text-sm font-medium">{t.keyword}</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, j) => (
                  <div
                    key={j}
                    className={`h-1.5 w-1.5 rounded-full ${
                      j < heat ? (j < 3 ? 'bg-brand-red' : 'bg-brand-yellow') : 'bg-ink-700'
                    }`}
                  />
                ))}
              </div>
              {t.category && (
                <span className="rounded bg-ink-800 px-1.5 py-0.5 text-[10px] text-muted">{t.category}</span>
              )}
            </div>
          );
        })}
        {items.length === 0 && <div className="py-8 text-center text-xs text-muted">ยังไม่มีข้อมูล</div>}
      </div>
    </div>
  );
}
