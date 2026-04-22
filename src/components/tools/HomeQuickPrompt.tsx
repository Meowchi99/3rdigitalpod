'use client';

import { useState } from 'react';
import {
  ActionButton,
  Field,
  SelectField,
  Pill,
  showToast,
} from '@/components/ui';

export default function HomeQuickPrompt() {
  const [keyword, setKeyword] = useState('');
  const [style, setStyle] = useState('Bold Typography');
  const [audience, setAudience] = useState('unisex');
  const [season, setSeason] = useState('evergreen');
  const [depth, setDepth] = useState<'simple' | 'detailed' | 'pro'>('detailed');
  const [promptOut, setPromptOut] = useState('');
  const [listingOut, setListingOut] = useState('');
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!keyword.trim()) {
      showToast('⚠️ กรุณากรอก Keyword ก่อน');
      return;
    }
    setBusy(true);
    try {
      const [promptRes, listingRes] = await Promise.all([
        fetch('/api/prompt/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword, style, audience, season, depth }),
        }).then((r) => r.json()),
        fetch('/api/listing/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            niche: keyword,
            product_type: 'T-Shirt',
            audience,
            occasion: season.includes('christmas')
              ? 'christmas'
              : season.includes("mother") ? "mother's day" : 'everyday',
          }),
        }).then((r) => r.json()),
      ]);
      setPromptOut(promptRes.prompt || '—');
      setListingOut(
        [
          `BRAND: ${listingRes.brand}`,
          `TITLE: ${listingRes.title}`,
          ``,
          `• ${listingRes.bullet_1}`,
          `• ${listingRes.bullet_2}`,
          ``,
          listingRes.description,
        ].join('\n')
      );
    } catch (e) {
      showToast('❌ Generation failed');
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  function copy(text: string) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => showToast('📋 Copied!'));
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-900">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
        <div className="text-sm font-bold">
          🎨 Prompt Generator{' '}
          <span className="ml-1 font-normal text-muted">
            — ใช้งานได้แม้ไม่มี API
          </span>
        </div>
        <span className="rounded-md bg-brand-blue/15 px-2 py-1 font-mono text-[10px] text-brand-blue-3">
          ✓ Fallback Ready
        </span>
      </div>

      <div className="grid gap-0 md:grid-cols-2">
        {/* Inputs */}
        <div className="flex flex-col gap-3.5 border-b border-white/[0.07] p-6 md:border-b-0 md:border-r">
          <Field
            label="Keyword / Niche"
            placeholder="เช่น Dog Mom, Nurse Life, Camping..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <SelectField label="Style" value={style} onChange={(e) => setStyle(e.target.value)}>
            {['Bold Typography', 'Vintage Retro', 'Cute Kawaii', 'Minimalist', 'Hand-drawn', 'Grunge Distressed'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </SelectField>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Audience
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['women', 'men', 'unisex', 'kids', 'seniors'].map((a) => (
                <Pill
                  key={a}
                  color="blue"
                  active={audience === a}
                  onClick={() => setAudience(a)}
                >
                  {a}
                </Pill>
              ))}
            </div>
          </div>
          <SelectField label="Holiday / Season" value={season} onChange={(e) => setSeason(e.target.value)}>
            {['evergreen', 'christmas', "mother's day", 'summer', 'halloween', 'valentine'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </SelectField>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Prompt Depth
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(['simple', 'detailed', 'pro'] as const).map((d) => (
                <Pill
                  key={d}
                  color="red"
                  active={depth === d}
                  onClick={() => setDepth(d)}
                >
                  {d}
                </Pill>
              ))}
            </div>
          </div>
          <ActionButton variant="generate" onClick={run} disabled={busy}>
            {busy ? '⏳ Generating...' : '✨ Generate Prompt & Listing'}
          </ActionButton>
        </div>

        {/* Outputs */}
        <div className="flex flex-col gap-3.5 p-6">
          <div>
            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted">
              🎨 Design Prompt
            </div>
            <div className="min-h-[100px] whitespace-pre-wrap rounded-lg border border-white/[0.07] bg-ink-800 p-3.5 font-mono text-xs leading-relaxed text-muted">
              {promptOut || 'กรอก keyword แล้วกด Generate...'}
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted">
              📝 SEO Listing
            </div>
            <div className="min-h-[120px] whitespace-pre-wrap rounded-lg border border-white/[0.07] bg-ink-800 p-3.5 font-mono text-xs leading-relaxed text-muted">
              {listingOut || 'Listing จะแสดงที่นี่...'}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => copy(promptOut)}
              className="flex-1 rounded-lg bg-gradient-to-r from-brand-blue to-brand-blue-3 py-2 text-sm font-bold text-white hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,85,255,0.4)]"
            >
              📋 Copy Prompt
            </button>
            <button
              onClick={() => copy(listingOut)}
              className="flex-1 rounded-lg border border-white/[0.07] bg-ink-800 py-2 text-sm font-bold hover:bg-ink-700"
            >
              📋 Copy Listing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
