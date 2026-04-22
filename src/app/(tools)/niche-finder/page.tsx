'use client';

import { useState } from 'react';
import { ActionButton, Field, InfoPanel, Pill, Section, SelectField, showToast } from '@/components/ui';
import type { NicheResult } from '@/lib/engines/niche-finder';

export default function NicheFinderPage() {
  const [seed, setSeed] = useState('');
  const [audience, setAudience] = useState('unisex');
  const [season, setSeason] = useState('evergreen');
  const [competition, setCompetition] = useState<'low' | 'medium' | 'any'>('any');
  const [niches, setNiches] = useState<NicheResult[]>([]);
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!seed.trim()) return showToast('⚠️ กรุณากรอก Seed');
    setBusy(true);
    try {
      const res = await fetch('/api/niche/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed, audience, season, competition_target: competition }),
      }).then((r) => r.json());
      setNiches(res.niches);
    } catch {
      showToast('❌ Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section title="🎯 NICHE FINDER" subtitle="AI หา 5 Niches ที่มีโอกาสขายดีจาก Seed Keyword">
      <div className="grid gap-5 md:grid-cols-2">
        <InfoPanel title="📋 Input">
          <div className="flex flex-col gap-3.5">
            <Field label="Seed Keyword / Interest" value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="เช่น dog, fishing, nurse..." />
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">Target Audience</label>
              <div className="flex flex-wrap gap-1.5">
                {['women', 'men', 'unisex', 'kids'].map((a) => (
                  <Pill key={a} color="blue" active={audience === a} onClick={() => setAudience(a)}>{a}</Pill>
                ))}
              </div>
            </div>
            <SelectField label="Season" value={season} onChange={(e) => setSeason(e.target.value)}>
              <option>evergreen</option>
              <option>Q4 / Christmas</option>
              <option>Q1</option>
              <option>Q2 / Spring</option>
              <option>Q3 / Summer</option>
            </SelectField>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">Competition Level</label>
              <div className="flex flex-wrap gap-1.5">
                {(['low', 'medium', 'any'] as const).map((c) => (
                  <Pill key={c} color="red" active={competition === c} onClick={() => setCompetition(c)}>
                    {c === 'low' ? '🟢 Low' : c === 'medium' ? '🟡 Medium' : '🔵 Any'}
                  </Pill>
                ))}
              </div>
            </div>
            <ActionButton variant="generate" onClick={run} disabled={busy}>
              {busy ? '⏳ Finding...' : '✦ Find 5 Niches'}
            </ActionButton>
          </div>
        </InfoPanel>

        <InfoPanel title="🎯 Niche Results">
          {niches.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted">กรอก Keyword และกด Find...</div>
          ) : (
            <div className="space-y-2.5">
              {niches.map((n, i) => (
                <div key={i} className="rounded-lg bg-ink-800 p-4">
                  <div className="mb-1 text-sm font-bold">
                    {i + 1}. {n.name}
                  </div>
                  <div className="flex gap-3 text-[11px]">
                    <span className="text-brand-yellow">Heat: {n.heat}</span>
                    <span className="text-brand-blue-3">Competition: {n.competition}</span>
                    <span className="text-muted">Score: {n.score.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </InfoPanel>
      </div>
    </Section>
  );
}
