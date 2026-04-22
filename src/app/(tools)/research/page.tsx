'use client';

import { useState } from 'react';
import { ActionButton, Field, InfoPanel, Pill, Section, SelectField, showToast } from '@/components/ui';

const STYLES = ['Vintage Retro', 'Cute Kawaii', 'Bold Typography', 'Minimalist', 'Hand-drawn', 'Grunge Distressed'];

export default function ResearchPromptPage() {
  const [month, setMonth] = useState('April');
  const [tool, setTool] = useState('Midjourney');
  const [style, setStyle] = useState('Bold Typography');
  const [niche, setNiche] = useState('');
  const [result, setResult] = useState('');
  const [busy, setBusy] = useState(false);

  async function generate() {
    if (!niche.trim()) return showToast('⚠️ กรุณากรอก Niche');
    setBusy(true);
    try {
      const res = await fetch('/api/prompt/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: niche,
          style,
          season: month,
          tool: tool.toLowerCase(),
          depth: 'detailed',
        }),
      }).then((r) => r.json());
      setResult(res.prompt);
    } catch {
      showToast('❌ Failed');
    } finally {
      setBusy(false);
    }
  }

  function copy() {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => showToast('📋 Copied!'));
  }

  return (
    <Section title="🔍 RESEARCH & PROMPT" subtitle="วิจัย Niche และสร้าง Design Prompt">
      <div className="grid gap-5 md:grid-cols-2">
        <InfoPanel title="📋 Input">
          <div className="flex flex-col gap-3.5">
            <Field label="Niche / Keyword" value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="เช่น Nurse Life, Dog Mom..." />
            <SelectField label="Month / Season" value={month} onChange={(e) => setMonth(e.target.value)}>
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </SelectField>
            <SelectField label="AI Tool Target" value={tool} onChange={(e) => setTool(e.target.value)}>
              <option>Midjourney</option>
              <option>DALL-E 3</option>
              <option>Ideogram</option>
              <option>Leonardo AI</option>
            </SelectField>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">Style</label>
              <div className="flex flex-wrap gap-1.5">
                {STYLES.map((s) => (
                  <Pill key={s} color="red" active={style === s} onClick={() => setStyle(s)}>
                    {s}
                  </Pill>
                ))}
              </div>
            </div>
            <ActionButton variant="generate" onClick={generate} disabled={busy}>
              {busy ? '⏳ Generating...' : '🎨 Generate Design Prompt'}
            </ActionButton>
          </div>
        </InfoPanel>

        <InfoPanel title="🎨 Output">
          <div className="min-h-[300px] whitespace-pre-wrap rounded-lg bg-ink-800 p-4 font-mono text-xs leading-relaxed text-muted">
            {result || 'กด Generate เพื่อสร้าง Prompt...'}
          </div>
          {result && (
            <div className="mt-3 flex gap-2">
              <ActionButton variant="secondary" onClick={copy} className="flex-1">
                📋 Copy Prompt
              </ActionButton>
            </div>
          )}
        </InfoPanel>
      </div>
    </Section>
  );
}
