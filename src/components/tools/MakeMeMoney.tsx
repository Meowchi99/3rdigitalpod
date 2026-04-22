'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ActionButton, Field, Pill, showToast } from '@/components/ui';
import type { MoneyPack, GoalMode } from '@/lib/engines/make-money';

const GOAL_MODES: { value: GoalMode; label: string; emoji: string; desc: string }[] = [
  { value: 'fast_money', label: 'Fast Money', emoji: '💸', desc: 'Low competition · ขายได้เร็ว' },
  { value: 'trend',      label: 'Trend',      emoji: '🔥', desc: 'กำลังมาแรงตอนนี้' },
  { value: 'evergreen',  label: 'Evergreen',  emoji: '♾', desc: 'ขายได้ทั้งปี' },
  { value: 'seasonal',   label: 'Seasonal',   emoji: '🗓', desc: 'Peak season coming' },
];

const STYLES = ['Vintage Retro', 'Bold Typography', 'Cute Kawaii', 'Minimalist', 'Hand-drawn', 'Grunge Distressed'];
const AUDIENCES = ['women', 'men', 'unisex', 'kids', 'seniors'];

interface UsageInfo {
  current: number;
  limit: number;
  plan: string;
  remaining: number;
}

export default function MakeMeMoney() {
  const [seed, setSeed] = useState('');
  const [mode, setMode] = useState<GoalMode>('fast_money');
  const [audience, setAudience] = useState('unisex');
  const [style, setStyle] = useState('Vintage Retro');

  const [pack, setPack] = useState<MoneyPack | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  async function generate() {
    setBusy(true);
    try {
      const res = await fetch('/api/make-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seedKeyword: seed || undefined,
          goalMode: mode,
          audience,
          style,
        }),
      });
      const data = await res.json();

      if (res.status === 403 && data.error === 'USAGE_LIMIT_REACHED') {
        setPaywall(true);
        setUsage({ current: data.current, limit: data.limit, plan: data.plan, remaining: 0 });
        return;
      }
      if (!res.ok) {
        showToast('❌ ' + (data.message || data.error || 'Failed'));
        return;
      }

      setPack(data);
      setUsage(data.usage);
      // smooth-scroll to result area on mobile
      setTimeout(() => document.getElementById('mmm-result')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    } catch (e) {
      showToast('❌ Network error');
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  async function generateSimilar() {
    if (!pack) return;
    setSeed(pack.selectedSeed);
    await generate();
  }

  async function save(kind: 'prompt' | 'listing' | 'full') {
    if (!pack) return;
    const payload =
      kind === 'full'
        ? {
            output_type: 'niche',
            title: pack.selectedNiche,
            input_json: { seed: pack.selectedSeed, goalMode: pack.goal_mode, audience, style },
            output_json: pack,
          }
        : kind === 'prompt'
        ? {
            output_type: 'prompt',
            title: pack.selectedNiche,
            input_json: { seed: pack.selectedSeed, style },
            output_json: pack.prompt,
          }
        : {
            output_type: 'listing',
            title: pack.listing.title,
            input_json: { niche: pack.selectedNiche },
            output_json: pack.listing,
          };

    const res = await fetch('/api/save-output', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (res.status === 401) {
      showToast('🔒 ต้องล็อกอินก่อนเซฟ');
      return;
    }
    if (!res.ok) {
      showToast('❌ ' + (data.message || data.error));
      return;
    }
    setSavedIds((prev) => [...prev, data.id]);
    showToast('✅ Saved to Merch Hub');
  }

  function copy(text: string, label: string) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => showToast(`📋 ${label} copied`));
  }

  function sendToExtension() {
    if (!pack) return;
    // Post to Chrome extension via window message or direct URL scheme
    const payload = {
      type: '3R_POD_LISTING',
      brand: pack.listing.brand,
      title: pack.listing.title,
      bullet_1: pack.listing.bullet_1,
      bullet_2: pack.listing.bullet_2,
      description: pack.listing.description,
      prompt: pack.prompt.prompt,
    };
    window.postMessage(payload, '*');
    // Also copy to clipboard as fallback
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    showToast('📦 Sent to Extension (also copied to clipboard)');
  }

  return (
    <div className="relative mx-auto max-w-6xl px-6 py-12">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -left-20 top-10 h-[300px] w-[300px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,214,0,0.08) 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-10 h-[300px] w-[300px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,45,120,0.08) 0%, transparent 70%)' }}
      />

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-3 py-1 font-mono text-[11px] font-bold text-brand-yellow">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-yellow" />
            CORE FEATURE · ONE-CLICK MONEY PACK
          </div>
          <h2 className="font-display text-5xl tracking-widest">
            💰 <span className="text-brand-yellow">MAKE ME</span>{' '}
            <span className="text-gradient-brand">MONEY</span>
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            กดครั้งเดียว — ได้ Niche + Prompt + Listing พร้อมขายทันที
          </p>
        </div>
        {usage && (
          <div className="rounded-lg border border-white/[0.07] bg-ink-900 px-4 py-2.5 text-right">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
              Today · {usage.plan}
            </div>
            <div className="font-mono text-sm font-bold">
              <span className={usage.remaining === 0 ? 'text-brand-red-3' : 'text-brand-yellow'}>
                {usage.current}
              </span>
              <span className="text-muted"> / {usage.limit === 999999 ? '∞' : usage.limit}</span>
            </div>
          </div>
        )}
      </div>

      {/* Panel */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-900">
        {/* Top gradient stripe */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand-yellow via-brand-red via-60% to-brand-pink" />

        <div className="grid gap-0 lg:grid-cols-[380px_1fr]">
          {/* ─── INPUT PANEL ─── */}
          <div className="flex flex-col gap-4 border-b border-white/[0.07] p-6 lg:border-b-0 lg:border-r">
            <Field
              label="Seed Keyword (optional)"
              placeholder="ปล่อยว่าง = ระบบสุ่มจาก trend pool"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
            />

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted">
                🎯 Goal Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {GOAL_MODES.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setMode(g.value)}
                    className={`flex flex-col items-start rounded-lg border p-2.5 text-left transition-all ${
                      mode === g.value
                        ? 'border-brand-yellow bg-brand-yellow/10 shadow-[0_0_0_1px_rgba(255,214,0,0.3)]'
                        : 'border-white/[0.07] bg-ink-800 hover:border-white/15'
                    }`}
                  >
                    <span className="text-base">{g.emoji}</span>
                    <span className={`text-xs font-bold ${mode === g.value ? 'text-brand-yellow' : 'text-white'}`}>
                      {g.label}
                    </span>
                    <span className="text-[10px] leading-tight text-muted">{g.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted">
                Audience
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AUDIENCES.map((a) => (
                  <Pill key={a} color="blue" active={audience === a} onClick={() => setAudience(a)}>
                    {a}
                  </Pill>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted">
                Style
              </label>
              <div className="flex flex-wrap gap-1.5">
                {STYLES.map((s) => (
                  <Pill key={s} color="pink" active={style === s} onClick={() => setStyle(s)}>
                    {s}
                  </Pill>
                ))}
              </div>
            </div>

            <button
              onClick={generate}
              disabled={busy}
              className="group relative mt-2 overflow-hidden rounded-xl bg-gradient-to-r from-brand-yellow via-orange-400 to-brand-pink py-4 text-base font-black tracking-wide text-black transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(255,214,0,0.35)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="relative z-10">
                {busy ? '⏳ กำลัง Generate...' : '💸 MAKE ME MONEY'}
              </span>
              <div className="absolute inset-0 -z-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </button>

            {pack && (
              <button
                onClick={generateSimilar}
                disabled={busy}
                className="rounded-lg border border-white/[0.07] bg-ink-800 py-2.5 text-sm font-semibold transition-all hover:border-white/20"
              >
                🎲 Generate Similar
              </button>
            )}

            <p className="text-[11px] leading-relaxed text-muted">
              💡 Free: 3 packs/day · <Link href="/pricing" className="text-brand-yellow hover:underline">Upgrade Pro</Link> for unlimited
            </p>
          </div>

          {/* ─── RESULT PANEL ─── */}
          <div id="mmm-result" className="p-6">
            {!pack ? (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 text-6xl opacity-20">💰</div>
                <div className="font-display text-2xl tracking-widest text-muted">READY TO PRINT MONEY</div>
                <div className="mt-2 max-w-sm text-xs text-muted">
                  เลือก Goal Mode แล้วกด <span className="font-bold text-brand-yellow">MAKE ME MONEY</span>{' '}
                  — ระบบจะเลือก niche, สร้าง prompt และ SEO listing ให้ในครั้งเดียว
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* NICHE CARD */}
                <div className="relative overflow-hidden rounded-xl border border-brand-yellow/40 bg-gradient-to-br from-brand-yellow/10 via-ink-800 to-ink-900 p-5">
                  <div className="absolute right-0 top-0 font-display text-8xl leading-none tracking-widest opacity-[0.05]">
                    $$$
                  </div>
                  <div className="relative">
                    <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-brand-yellow">
                      ⭐ SELECTED NICHE · {pack.goal_mode.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="mb-3 font-display text-3xl tracking-wide text-white">
                      {pack.selectedNiche.toUpperCase()}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Stat label="Score" value={`${pack.score}/20`} color="yellow" big />
                      <Stat label="Demand" value={`${pack.demand}/10`} color="blue" />
                      <Stat label="Competition" value={`${pack.competition}/10`} color="red" />
                      {pack.season_boost > 0 && <Stat label="Season+" value={`+${pack.season_boost}`} color="pink" />}
                    </div>
                  </div>
                </div>

                {/* WHY CARD */}
                <div className="rounded-xl border border-brand-blue/30 bg-brand-blue/5 p-4">
                  <div className="mb-2 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider text-brand-blue-3">
                    💡 Why this works
                  </div>
                  <ul className="space-y-1.5 text-sm">
                    {pack.why.map((w, i) => (
                      <li key={i} className="leading-relaxed text-white/80">{w}</li>
                    ))}
                  </ul>
                </div>

                {/* PROMPT CARD */}
                <div className="rounded-xl border border-white/[0.07] bg-ink-800">
                  <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-2.5">
                    <div className="text-xs font-bold">🎨 Design Prompt</div>
                    <button onClick={() => copy(pack.prompt.prompt, 'Prompt')} className="rounded bg-ink-700 px-2.5 py-1 font-mono text-[10px] hover:bg-ink-900">
                      📋 COPY
                    </button>
                  </div>
                  <div className="p-4 font-mono text-xs leading-relaxed text-muted">
                    {pack.prompt.prompt}
                  </div>
                </div>

                {/* LISTING CARD */}
                <div className="rounded-xl border border-white/[0.07] bg-ink-800">
                  <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-2.5">
                    <div className="text-xs font-bold">📝 SEO Listing</div>
                    <button
                      onClick={() =>
                        copy(
                          `BRAND: ${pack.listing.brand}\nTITLE: ${pack.listing.title}\n\n• ${pack.listing.bullet_1}\n• ${pack.listing.bullet_2}\n\n${pack.listing.description}`,
                          'Listing'
                        )
                      }
                      className="rounded bg-ink-700 px-2.5 py-1 font-mono text-[10px] hover:bg-ink-900"
                    >
                      📋 COPY
                    </button>
                  </div>
                  <div className="space-y-2.5 p-4 text-xs">
                    <Row label="Brand" value={pack.listing.brand} />
                    <Row label="Title" value={pack.listing.title} />
                    <Row label="Bullet 1" value={pack.listing.bullet_1} />
                    <Row label="Bullet 2" value={pack.listing.bullet_2} />
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  <button onClick={() => save('full')} className="rounded-lg bg-brand-yellow py-2.5 text-xs font-bold text-black hover:bg-brand-yellow-2">
                    💾 Save to Hub
                  </button>
                  <button onClick={generateSimilar} disabled={busy} className="rounded-lg border border-white/[0.07] bg-ink-800 py-2.5 text-xs font-semibold hover:bg-ink-700">
                    🎲 Similar
                  </button>
                  <button onClick={sendToExtension} className="rounded-lg bg-gradient-to-r from-brand-blue to-brand-blue-3 py-2.5 text-xs font-bold text-white">
                    📦 → Extension
                  </button>
                  <Link href={`/seo-listing?niche=${encodeURIComponent(pack.selectedNiche)}`} className="flex items-center justify-center rounded-lg border border-white/[0.07] bg-ink-800 py-2.5 text-xs font-semibold hover:bg-ink-700">
                    📝 Edit SEO →
                  </Link>
                </div>

                {savedIds.length > 0 && (
                  <div className="text-center text-[11px] text-brand-blue-3">
                    ✓ Saved {savedIds.length} pack{savedIds.length > 1 ? 's' : ''} this session ·{' '}
                    <Link href="/merch-hub" className="underline">View in Hub</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PAYWALL MODAL */}
      {paywall && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-md rounded-2xl border border-brand-yellow/40 bg-ink-900 p-8 shadow-2xl">
            <div className="mb-4 text-center text-5xl">⏱</div>
            <h3 className="mb-2 text-center font-display text-3xl tracking-widest">DAILY LIMIT REACHED</h3>
            <p className="mb-6 text-center text-sm text-muted">
              คุณใช้ครบ <span className="font-bold text-white">{usage?.limit} packs</span> ของวันนี้แล้ว
              <br />
              อัปเกรดเป็น <span className="font-bold text-brand-yellow">Pro</span> เพื่อ generate ได้ไม่อั้น
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/pricing"
                className="rounded-xl bg-gradient-to-r from-brand-yellow to-brand-pink py-3 text-center text-sm font-bold text-black hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(255,214,0,0.35)]"
              >
                🚀 Upgrade to Pro
              </Link>
              <button onClick={() => setPaywall(false)} className="rounded-lg py-2 text-xs text-muted hover:text-white">
                ปิดหน้าต่างนี้
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color, big }: { label: string; value: string; color: 'yellow' | 'blue' | 'red' | 'pink'; big?: boolean }) {
  const colors = {
    yellow: 'border-brand-yellow/30 bg-brand-yellow/10 text-brand-yellow',
    blue: 'border-brand-blue/30 bg-brand-blue/10 text-brand-blue-3',
    red: 'border-brand-red/30 bg-brand-red/10 text-brand-red-3',
    pink: 'border-brand-pink/30 bg-brand-pink/10 text-brand-pink',
  };
  return (
    <div className={`rounded-lg border px-2.5 py-1.5 ${colors[color]}`}>
      <div className="font-mono text-[9px] uppercase tracking-wider opacity-70">{label}</div>
      <div className={`font-mono font-bold ${big ? 'text-base' : 'text-xs'}`}>{value}</div>
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
