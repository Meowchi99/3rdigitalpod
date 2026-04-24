import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Section } from '@/components/ui';
import HomeQuickPrompt from '@/components/tools/HomeQuickPrompt';
import MakeMeMoney from '@/components/tools/MakeMeMoney';
import SoldDesignsSection from '@/components/tools/SoldDesignsSection';
import type {
  WinningDesign,
  Trend,
  ExternalLink as ExtLink,
  SoldDesign,
} from '@/types';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { data: designs },
    { data: soldDesigns },
    { data: dailyTrends },
    { data: monthlyTrends },
    { data: links },
  ] = await Promise.all([
    supabase
      .from('winning_designs')
      .select('*')
      .eq('is_published', true)
      .order('sort_order')
      .limit(6),
    supabase
      .from('sold_designs')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('trends')
      .select('*')
      .eq('trend_type', 'daily')
      .order('score', { ascending: false })
      .limit(5),
    supabase
      .from('trends')
      .select('*')
      .eq('trend_type', 'monthly')
      .order('score', { ascending: false })
      .limit(5),
    supabase
      .from('external_links')
      .select('*')
      .eq('is_published', true)
      .order('sort_order')
      .limit(6),
  ]);

  return (
    <>
      {/* HERO */}
      <div className="relative mx-auto max-w-5xl px-6 pb-16 pt-20 text-center">
        <div
          className="pointer-events-none absolute left-[10%] top-[-100px] h-[400px] w-[400px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(232,0,28,0.08) 0%, transparent 70%)',
          }}
        />
        <div
          className="pointer-events-none absolute right-[5%] top-[-80px] h-[400px] w-[400px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(0,85,255,0.07) 0%, transparent 70%)',
          }}
        />

        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-brand-red/30 bg-ink-800 px-3.5 py-1.5 font-mono text-xs text-brand-red-3">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-red" />
          v1.4.0 · AI Toolkit สำหรับ POD
        </div>

        <h1 className="mb-6 font-display text-[clamp(48px,8vw,88px)] leading-[0.95] tracking-widest">
          <div className="text-white">AI TOOLKIT</div>
          <div className="text-gradient-brand">PRINT ON DEMAND</div>
          <div className="text-brand-yellow">ครบจบในที่เดียว</div>
        </h1>

        <p className="mx-auto mb-9 max-w-xl text-base leading-relaxed text-muted">
          รวม <span className="font-semibold text-white">12+ เครื่องมือ</span> ที่นัก POD
          ใช้จริงทุกวัน — ตั้งแต่หา{' '}
          <span className="font-semibold text-white">Niche</span>, ตรวจ{' '}
          <span className="font-semibold text-white">TM 7 ประเทศ</span>, คำนวณ{' '}
          <span className="font-semibold text-white">Royalty</span>, สร้าง{' '}
          <span className="font-semibold text-white">SEO Listing</span> และ Prompt
        </p>

        <div className="mb-14 flex flex-wrap justify-center gap-3">
          <Link
            href="/research"
            className="rounded-lg bg-brand-red px-7 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-red-2 hover:shadow-[0_8px_30px_rgba(232,0,28,0.4)]"
          >
            🚀 เริ่มใช้งานฟรี
          </Link>
          <Link
            href="#tools"
            className="rounded-lg border border-white/[0.07] px-7 py-3 text-sm font-semibold text-white hover:border-white/20 hover:bg-ink-800"
          >
            ดูทุกฟีเจอร์ ↓
          </Link>
        </div>

        <div className="mx-auto grid max-w-xl grid-cols-4 overflow-hidden rounded-xl border border-white/[0.07]">
          {[
            ['12+', 'เครื่องมือ', 'text-brand-red'],
            ['7', 'ประเทศ TM', 'text-brand-blue-3'],
            ['2', 'AI Provider', 'text-brand-yellow'],
            ['0฿', 'เริ่มต้น', 'text-brand-pink'],
          ].map(([num, label, color], i) => (
            <div
              key={i}
              className={`p-5 text-center ${
                i < 3 ? 'border-r border-white/[0.07]' : ''
              }`}
            >
              <div className={`font-display text-3xl leading-none ${color}`}>
                {num}
              </div>
              <div className="mt-1 text-[11px] tracking-wider text-muted">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="mx-6 border-white/[0.07]" />

      {/* ⭐ SOLD DESIGNS — social proof (owner-managed) */}
      <SoldDesignsSection designs={(soldDesigns as SoldDesign[] | null) ?? []} />

      <hr className="mx-6 border-white/[0.07]" />

      {/* ⭐ MAKE ME MONEY — core feature */}
      <MakeMeMoney />

      <hr className="mx-6 border-white/[0.07]" />

      {/* WINNING DESIGNS */}
      <Section title="🏆 WINNING DESIGNS TODAY" subtitle="ดีไซน์ขายดีที่น่าจับตาในวันนี้ — คัดมาเพื่อให้แรงบันดาลใจ">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {(designs as WinningDesign[] | null)?.map((d, i) => (
            <WinningCard key={d.id} design={d} index={i} />
          ))}
        </div>
      </Section>

      <hr className="mx-6 border-white/[0.07]" />

      {/* TRENDS */}
      <Section title="📡 TREND RADAR" subtitle="เทรนด์ที่กำลังร้อนแรง — อัปเดตรายวันและรายเดือน">
        <div className="grid gap-5 md:grid-cols-2">
          <TrendBox
            title="🔥 Daily Trends"
            tag="TODAY"
            tagClass="bg-brand-red/15 text-brand-red-3"
            trends={dailyTrends as Trend[] | null}
          />
          <TrendBox
            title="📅 Monthly Trends"
            tag="THIS MONTH"
            tagClass="bg-brand-blue/15 text-brand-blue-3"
            trends={monthlyTrends as Trend[] | null}
          />
        </div>
      </Section>

      <hr className="mx-6 border-white/[0.07]" />

      {/* QUICK PROMPT GENERATOR */}
      <Section title="⚡ QUICK PROMPT GENERATOR" subtitle="สร้าง Design Prompt และ SEO Listing ได้ในทันที">
        <HomeQuickPrompt />
      </Section>

      {/* QUICK TOOLS */}
      <Section title="🧰 QUICK ACCESS TOOLS" subtitle="" className="" >
        <div id="tools" className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5">
          {[
            { href: '/tm-checker', icon: '🛡️', title: 'TM Checker', desc: 'ตรวจ TM 7 ประเทศก่อนอัปดีไซน์', color: 'red' },
            { href: '/bsr', icon: '📊', title: 'BSR → Sales', desc: 'ประมาณยอดขายจาก Best Seller Rank', color: 'blue' },
            { href: '/royalty', icon: '💰', title: 'Royalty Calculator', desc: 'คำนวณ Royalty ต่อชิ้น ทุก marketplace', color: 'yellow' },
            { href: '/design-analyzer', icon: '🔬', title: 'Design Analyzer', desc: 'AI ให้คะแนน 10 มิติ + Sell Verdict', color: 'pink' },
            { href: '/niche-finder', icon: '🎯', title: 'Niche Finder', desc: 'AI หา 5 Niches ที่มีโอกาสขายดี', color: 'blue' },
            { href: '/batch', icon: '⚡', title: 'Batch Generator', desc: 'สร้าง Listing หลายรายการพร้อมกัน', color: 'red' },
          ].map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group relative flex flex-col gap-2.5 overflow-hidden rounded-xl border border-white/[0.07] bg-ink-900 p-5 transition-all hover:-translate-y-0.5 hover:border-white/15"
            >
              <span
                className={`absolute left-0 right-0 top-0 h-0.5 opacity-0 transition-opacity group-hover:opacity-100 ${
                  t.color === 'red'
                    ? 'bg-gradient-to-r from-brand-red to-brand-pink'
                    : t.color === 'blue'
                    ? 'bg-gradient-to-r from-brand-blue to-brand-blue-3'
                    : t.color === 'yellow'
                    ? 'bg-gradient-to-r from-brand-yellow to-orange-400'
                    : 'bg-gradient-to-r from-brand-pink to-brand-red-3'
                }`}
              />
              <div className="text-3xl leading-none">{t.icon}</div>
              <div className="text-sm font-bold">{t.title}</div>
              <div className="text-xs leading-relaxed text-muted">{t.desc}</div>
              <div className="mt-auto flex items-center gap-1 text-xs text-muted">
                เปิดเครื่องมือ →
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* AMAZON LINKS */}
      <div className="border-y border-white/[0.07] bg-ink-900 py-12 px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 font-display text-4xl tracking-widest">🛒 AMAZON RESEARCH LINKS</h2>
          <p className="mb-8 text-sm text-muted">ลิงก์ตรงไป Amazon สำหรับเช็คคู่แข่งและเทรนด์</p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
            {(links as ExtLink[] | null)?.map((l) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-ink-900 px-4 py-3.5 transition-all hover:translate-x-0.5 hover:border-brand-yellow/30 hover:bg-ink-800"
              >
                <span className="text-xl">{l.icon || '🔗'}</span>
                <div>
                  <div className="text-sm font-medium text-white">{l.label}</div>
                  <div className="truncate text-xs text-muted">{l.url.replace(/https?:\/\//, '')}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Winning Card ───
function WinningCard({ design, index }: { design: WinningDesign; index: number }) {
  const gradients = [
    'from-[#1a0010] to-[#300020]',
    'from-[#00102a] to-[#001845]',
    'from-[#1a1200] to-[#2a1e00]',
    'from-[#001a1a] to-[#002a2a]',
    'from-[#1a0020] to-[#280030]',
    'from-[#1a1000] to-[#2a1800]',
  ];
  const textColors = ['text-brand-red-3', 'text-brand-blue-3', 'text-brand-yellow', 'text-emerald-400', 'text-brand-pink', 'text-orange-400'];
  const badgeClass = {
    daily: 'bg-brand-red text-white',
    monthly: 'bg-brand-blue text-white',
    evergreen: 'bg-ink-700 text-brand-yellow border border-brand-yellow/30',
  }[design.badge];

  return (
    <div className="group overflow-hidden rounded-xl border border-white/[0.07] bg-ink-900 transition-all hover:-translate-y-1 hover:border-brand-red/40 hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
      <div className={`relative flex aspect-square items-center justify-center bg-gradient-to-br ${gradients[index % 6]}`}>
        {design.image_url ? (
          <img src={design.image_url} alt={design.title} className="h-full w-full object-cover" />
        ) : (
          <div className={`text-center font-display text-[22px] leading-tight tracking-widest ${textColors[index % 6]}`}>
            {design.title.toUpperCase().split(' ').slice(0, 2).join(' ')}
          </div>
        )}
        <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold tracking-wide ${badgeClass}`}>
          {design.badge.toUpperCase()}
        </span>
      </div>
      <div className="p-3">
        <div className="truncate text-sm font-bold">{design.title}</div>
        <div className="mb-2.5 text-xs text-muted">{design.niche}</div>
        <div className="flex gap-1.5">
          {design.amazon_url && (
            <a href={design.amazon_url} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-md bg-brand-yellow py-1 text-center text-[11px] font-semibold text-black hover:bg-brand-yellow-2">
              Amazon
            </a>
          )}
          <Link
            href={`/research?niche=${encodeURIComponent(design.main_keyword || design.title)}`}
            className="flex-1 rounded-md border border-white/[0.07] bg-ink-800 py-1 text-center text-[11px] font-semibold hover:bg-ink-700"
          >
            Prompt
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Trend Box ───
function TrendBox({
  title,
  tag,
  tagClass,
  trends,
}: {
  title: string;
  tag: string;
  tagClass: string;
  trends: Trend[] | null;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-ink-900">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3.5">
        <div className="flex items-center gap-2 text-sm font-bold">
          <span>{title}</span>
          <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${tagClass}`}>
            {tag}
          </span>
        </div>
      </div>
      <div className="p-2">
        {trends?.map((t, i) => (
          <div
            key={t.id}
            className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-ink-800"
          >
            <span className="w-5 text-right font-mono text-xs text-muted">{i + 1}</span>
            <span className="flex-1 text-sm font-medium">{t.keyword}</span>
            <HeatDots score={t.score} />
            <span className="rounded bg-ink-800 px-1.5 py-0.5 text-[10px] text-muted">
              {t.category}
            </span>
          </div>
        ))}
        {(!trends || trends.length === 0) && (
          <div className="py-8 text-center text-xs text-muted">ยังไม่มีเทรนด์</div>
        )}
      </div>
    </div>
  );
}

function HeatDots({ score }: { score: number }) {
  const active = Math.min(5, Math.max(1, Math.round(score / 20)));
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i < active
              ? i < 3
                ? 'bg-brand-red'
                : 'bg-brand-yellow'
              : 'bg-ink-700'
          }`}
        />
      ))}
    </div>
  );
}
