'use client';

import { useState } from 'react';
import { ActionButton, Field, InfoPanel, Pill, Section, SelectField, showToast } from '@/components/ui';
import { expandPromptFallback } from '@/lib/engines/prompt-engine';

export default function ExpandPromptPage() {
  const [niche, setNiche] = useState('');
  const [mix, setMix] = useState<'mixed' | 'same'>('mixed');
  const [count, setCount] = useState(5);
  const [results, setResults] = useState<string[]>([]);

  function run() {
    if (!niche.trim()) return showToast('⚠️ กรุณากรอก Niche');
    const prompts = expandPromptFallback(niche, count, mix);
    setResults(prompts.map((p) => p.prompt));
  }

  function copyAll() {
    if (results.length === 0) return;
    navigator.clipboard.writeText(results.map((r, i) => `[${i + 1}] ${r}`).join('\n\n')).then(() => showToast('📋 Copied all!'));
  }

  return (
    <Section title="🚀 EXPAND PROMPT" subtitle="ขยาย Niche เป็น Prompt หลายแบบในธีมเดียว">
      <div className="grid gap-5 md:grid-cols-2">
        <InfoPanel title="📋 Input">
          <div className="flex flex-col gap-3.5">
            <Field label="Niche / Theme" value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="เช่น Dog Mom, Fishing Dad..." />
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">Style Mix</label>
              <div className="flex gap-2">
                <Pill color="blue" active={mix === 'mixed'} onClick={() => setMix('mixed')}>🎭 Mixed</Pill>
                <Pill color="blue" active={mix === 'same'} onClick={() => setMix('same')}>🎯 Same Style</Pill>
              </div>
            </div>
            <SelectField label="Number of Prompts" value={String(count)} onChange={(e) => setCount(parseInt(e.target.value))}>
              {[3, 5, 7, 10].map((n) => <option key={n} value={n}>{n} prompts</option>)}
            </SelectField>
            <ActionButton variant="generate" onClick={run}>🚀 Expand Prompts</ActionButton>
            <ActionButton variant="secondary" onClick={copyAll} disabled={results.length === 0}>📋 Copy All</ActionButton>
          </div>
        </InfoPanel>

        <InfoPanel title="🚀 Output">
          {results.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted">กรอก Niche และกด Expand...</div>
          ) : (
            <div className="space-y-3">
              {results.map((r, i) => (
                <div key={i} className="rounded-lg bg-ink-800 p-3 font-mono text-xs leading-relaxed">
                  <div className="mb-1 text-[10px] font-bold text-brand-yellow">[{i + 1}]</div>
                  <div className="text-muted">{r}</div>
                </div>
              ))}
            </div>
          )}
        </InfoPanel>
      </div>
    </Section>
  );
}
