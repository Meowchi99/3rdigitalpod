import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import type { WinningDesign } from '@/types';

export const dynamic = 'force-dynamic';

export default async function PricingPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const { data: proofs } = await supabase
    .from('winning_designs')
    .select('title, niche, main_keyword, amazon_url')
    .eq('is_published', true)
    .limit(6);

  const currentPlan = profile?.plan || 'free';

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative mx-auto max-w-5xl px-6 pb-16 pt-20 text-center">
        <div className="pointer-events-none absolute left-1/4 top-10 h-[400px] w-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,214,0,0.1), transparent 70%)' }} />
        <div className="pointer-events-none absolute right-1/4 top-10 h-[400px] w-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,45,120,0.1), transparent 70%)' }} />

        <div className="relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-4 py-1.5 font-mono text-xs font-bold text-brand-yellow">
            ⚡ POWER UP YOUR POD WORKFLOW
          </div>
          <h1 className="mb-6 font-display text-[clamp(44px,7vw,80px)] leading-[0.95] tracking-widest">
            <div className="text-white">STOP GUESSING</div>
            <div className="text-gradient-brand">START SELLING</div>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-muted">
            ทุกวันที่คุณเปิดคอมฯ มองหา niche — คือทุกวันที่คู่แข่งอัปดีไซน์แซงคุณไปแล้ว
            <br />
            <span className="text-white">Make Me Money Pro</span> ใช้ AI สร้าง niche + prompt + listing{' '}
            <span className="font-bold text-brand-yellow">ไม่อั้น</span> ให้คุณโฟกัสแค่การออกแบบและอัป
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="#pricing" className="rounded-xl bg-gradient-to-r from-brand-yellow to-brand-pink px-8 py-3.5 text-sm font-black text-black hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(255,214,0,0.35)]">
              💰 ดู Pricing
            </Link>
            <Link href="/" className="rounded-xl border border-white/[0.07] px-8 py-3.5 text-sm font-semibold hover:border-white/20 hover:bg-ink-800">
              ลองฟรีก่อน →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── PROOF ─── */}
      <section className="bg-ink-900/50 py-16 px-6 border-y border-white/[0.07]">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <div className="mb-2 font-mono text-xs uppercase tracking-wider text-brand-blue-3">✅ REAL NICHES · REAL SALES</div>
            <h2 className="font-display text-4xl tracking-widest">NICHES ที่ขายได้จริงบน AMAZON</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {proofs?.map((p, i) => (
              <div key={i} className="rounded-xl border border-white/[0.07] bg-ink-900 p-4">
                <div className="mb-1 font-display text-lg tracking-wide">{p.title.toUpperCase()}</div>
                <div className="mb-3 text-xs text-muted">{p.niche}</div>
                {p.amazon_url && (
                  <a href={p.amazon_url} target="_blank" rel="noopener noreferrer" className="inline-block rounded bg-brand-yellow px-2.5 py-1 text-[10px] font-bold text-black hover:bg-brand-yellow-2">
                    ดูบน Amazon →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DEMO / OUTPUT EXAMPLE ─── */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <div className="mb-2 font-mono text-xs uppercase tracking-wider text-brand-yellow">⚡ DEMO · 1 CLICK = 1 MONEY PACK</div>
            <h2 className="font-display text-4xl tracking-widest">นี่คือสิ่งที่คุณจะได้ทุกครั้ง</h2>
          </div>
          <div className="rounded-2xl border border-white/[0.07] bg-ink-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-brand-yellow">⭐ SELECTED NICHE</span>
              <span className="rounded bg-brand-yellow/10 px-2 py-0.5 font-mono text-[10px] text-brand-yellow">Score 14.5/20</span>
            </div>
            <div className="mb-5 font-display text-3xl tracking-wide text-white">NURSE LIFE VINTAGE TEE</div>
            <div className="mb-4 space-y-2 border-t border-white/[0.07] pt-4 text-xs">
              <Row label="🎨 PROMPT" value="A highly detailed, print-ready t-shirt design about nurse life vintage tee, vintage retro style, distressed texture, aged look, transparent background, --ar 1:1 --v 6" />
              <Row label="📝 TITLE" value="Funny Nurse Life Vintage Tee | Perfect Gift for Nurses | Retro Medical Shirt" />
              <Row label="✨ BRAND" value="Nurse Apparel Co" />
            </div>
            <div className="rounded-lg border border-brand-blue/20 bg-brand-blue/5 p-3 text-xs">
              <strong className="text-brand-blue-3">💡 Why this works:</strong>{' '}
              <span className="text-white/80">High demand 9/10 · Competition 6/10 · Vintage style ขายดีทุกปี</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="bg-ink-900/50 py-16 px-6 border-y border-white/[0.07]">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-display text-4xl tracking-widest">WHY PRO CREATORS UPGRADE</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: '⚡', title: 'Unlimited Money Packs', desc: 'ไม่ติด 3/day อีกต่อไป — generate กี่ครั้งก็ได้ในแต่ละวัน' },
              { icon: '💾', title: 'Save to Merch Hub', desc: 'เก็บ niche/prompt/listing ทุกรายการ — ค้นหาและ re-use ได้' },
              { icon: '🎲', title: 'Generate Similar', desc: 'เจอ niche ที่ใช่แล้ว → ขยายเป็น 5-10 variations ได้ทันที' },
              { icon: '🔬', title: 'Vision Design Analyzer', desc: 'อัปรูปดีไซน์ → AI ให้คะแนน 10 มิติ + ad recommendation' },
              { icon: '⚡', title: 'Batch Generator', desc: 'ประมวลผล 50 รายการพร้อมกัน — ประหยัดเวลา 10x' },
              { icon: '📦', title: 'Chrome Extension', desc: 'Autofill หน้า Merch ได้เลย ไม่ต้อง copy-paste' },
            ].map((f, i) => (
              <div key={i} className="rounded-xl border border-white/[0.07] bg-ink-900 p-5">
                <div className="mb-2 text-3xl">{f.icon}</div>
                <div className="mb-1 text-sm font-bold">{f.title}</div>
                <div className="text-xs leading-relaxed text-muted">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-2 font-display text-4xl tracking-widest">CHOOSE YOUR PLAN</h2>
            <p className="text-sm text-muted">เริ่มต้นฟรี · อัปเกรดได้ทุกเมื่อ · ยกเลิกเมื่อไหร่ก็ได้</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <PlanCard
              name="FREE"
              price="$0"
              period="/ month"
              color="gray"
              current={currentPlan === 'free'}
              features={[
                { text: '3 Money Packs / day', included: true },
                { text: 'All tools access', included: true },
                { text: 'Fallback Mode', included: true },
                { text: 'Save to Hub', included: false },
                { text: 'Generate Similar', included: false },
                { text: 'Batch Generator', included: false },
              ]}
              cta={{ label: 'Current Plan', href: '/' }}
            />
            <PlanCard
              name="PRO"
              price="$19"
              period="/ month"
              color="yellow"
              highlight
              current={currentPlan === 'pro'}
              features={[
                { text: 'Unlimited Money Packs', included: true },
                { text: 'Save to Merch Hub', included: true },
                { text: 'Generate Similar', included: true },
                { text: 'Vision Design Analyzer', included: true },
                { text: 'Batch (50/day)', included: true },
                { text: 'Priority support', included: true },
              ]}
              cta={{ label: '🚀 Upgrade to Pro', href: '/api/checkout?plan=pro' }}
            />
            <PlanCard
              name="ELITE"
              price="$49"
              period="/ month"
              color="pink"
              current={currentPlan === 'elite'}
              features={[
                { text: 'Everything in Pro', included: true },
                { text: 'Unlimited Batch', included: true },
                { text: 'API access (coming)', included: true },
                { text: 'White-label exports', included: true },
                { text: 'Direct Discord access', included: true },
                { text: 'Custom AI fine-tuning', included: true },
              ]}
              cta={{ label: 'Go Elite', href: '/api/checkout?plan=elite' }}
            />
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-20 px-6 text-center bg-gradient-to-b from-ink-900 to-ink-950">
        <h2 className="mb-4 font-display text-5xl tracking-widest">
          <span className="text-white">EVERY DAY YOU WAIT</span>
          <br />
          <span className="text-gradient-brand">IS A SALE YOU MISS</span>
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-sm text-muted">
          คู่แข่งลง 10 ดีไซน์ต่อวันแล้ว — ถ้าคุณยังต้องคิด niche เอง 1 ชั่วโมงต่อรายการ คุณจะไม่มีวันตามทัน
        </p>
        <Link href="#pricing" className="inline-block rounded-xl bg-gradient-to-r from-brand-yellow to-brand-pink px-10 py-4 text-base font-black text-black hover:-translate-y-0.5 hover:shadow-[0_15px_50px_rgba(255,214,0,0.4)]">
          💰 UPGRADE NOW
        </Link>
      </section>
    </>
  );
}

function PlanCard({
  name, price, period, features, cta, color, highlight, current,
}: {
  name: string;
  price: string;
  period: string;
  features: { text: string; included: boolean }[];
  cta: { label: string; href: string };
  color: 'gray' | 'yellow' | 'pink';
  highlight?: boolean;
  current?: boolean;
}) {
  const border = highlight ? 'border-brand-yellow shadow-[0_0_0_1px_rgba(255,214,0,0.4),0_20px_60px_rgba(255,214,0,0.15)]' : 'border-white/[0.07]';
  const ctaBg = color === 'yellow' ? 'bg-gradient-to-r from-brand-yellow to-brand-pink text-black' : color === 'pink' ? 'bg-brand-pink text-white' : 'bg-ink-800 text-white border border-white/[0.07]';

  return (
    <div className={`relative rounded-2xl border ${border} bg-ink-900 p-6`}>
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-yellow px-3 py-1 font-mono text-[10px] font-bold text-black">
          MOST POPULAR
        </div>
      )}
      <div className="mb-6">
        <div className="font-display text-2xl tracking-widest">{name}</div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-display text-5xl">{price}</span>
          <span className="text-xs text-muted">{period}</span>
        </div>
      </div>
      <ul className="mb-6 space-y-2">
        {features.map((f, i) => (
          <li key={i} className={`flex items-start gap-2 text-xs ${f.included ? 'text-white' : 'text-muted line-through'}`}>
            <span className={f.included ? 'text-brand-blue-3' : 'text-muted'}>{f.included ? '✓' : '✕'}</span>
            <span>{f.text}</span>
          </li>
        ))}
      </ul>
      {current ? (
        <div className="rounded-lg border border-brand-blue/40 bg-brand-blue/10 py-3 text-center text-xs font-bold text-brand-blue-3">
          ✓ Current Plan
        </div>
      ) : (
        <a href={cta.href} className={`block rounded-lg py-3 text-center text-sm font-bold ${ctaBg} hover:-translate-y-0.5 transition-all`}>
          {cta.label}
        </a>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-0.5 text-white">{value}</div>
    </div>
  );
}
