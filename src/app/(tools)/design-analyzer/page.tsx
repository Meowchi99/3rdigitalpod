'use client';

import { useState } from 'react';
import {
  ActionButton,
  Field,
  InfoPanel,
  Section,
  showToast,
} from '@/components/ui';
import type { DesignAnalysisResult } from '@/types';

export default function DesignAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [tags, setTags] = useState('');
  const [nicheHint, setNicheHint] = useState('');
  const [result, setResult] = useState<DesignAnalysisResult | null>(null);
  const [busy, setBusy] = useState(false);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function analyze() {
    setBusy(true);
    try {
      let image_base64: string | undefined;
      if (file) {
        image_base64 = await fileToBase64(file);
      }
      const manualTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch('/api/analyze-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64,
          manual_tags: manualTags,
          niche_hint: nicheHint || undefined,
        }),
      });
      const data: DesignAnalysisResult = await res.json();
      setResult(data);
    } catch (e) {
      showToast('❌ Analysis failed');
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  async function sendToSEO() {
    if (!result) return;
    const query = new URLSearchParams({
      niche: result.suggested_niche,
      keywords: result.suggested_keywords.join(','),
    });
    window.location.href = `/seo-listing?${query.toString()}`;
  }

  const verdictColor =
    result?.verdict === 'YES'
      ? 'text-brand-blue-3'
      : result?.verdict === 'MAYBE'
      ? 'text-brand-yellow'
      : 'text-brand-red';

  return (
    <Section title="🔬 DESIGN ANALYZER" subtitle="ตรวจดีไซน์ก่อนอัป — AI ให้คะแนน 10 มิติ + Sell Verdict">
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Input panel */}
        <InfoPanel title="📤 Upload Design">
          <div className="flex flex-col gap-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/[0.07] p-8 transition-colors hover:border-brand-red/40">
              <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              {preview ? (
                <img src={preview} alt="preview" className="max-h-[240px] rounded-lg" />
              ) : (
                <>
                  <div className="text-4xl">📤</div>
                  <div className="mt-2 text-sm text-muted">คลิกเพื่ออัปโหลดรูป</div>
                  <div className="mt-1 text-xs text-muted">JPG / PNG / WEBP</div>
                </>
              )}
            </label>

            <Field
              label="Niche Hint (optional)"
              placeholder="เช่น nurse, dog, mechanic..."
              value={nicheHint}
              onChange={(e) => setNicheHint(e.target.value)}
            />
            <Field
              label="Manual Tags (คั่นด้วย ,)"
              placeholder="vintage, typography, bold, retro..."
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />

            <ActionButton variant="generate" onClick={analyze} disabled={busy}>
              {busy ? '🔬 Analyzing...' : '🔬 Analyze Design'}
            </ActionButton>
          </div>
        </InfoPanel>

        {/* Output panel */}
        <InfoPanel title="📊 Analysis Results">
          {!result ? (
            <div className="py-12 text-center text-sm text-muted">
              อัปโหลดรูปและกด Analyze เพื่อเริ่มวิเคราะห์...
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Verdict */}
              <div className="rounded-xl bg-ink-800 p-5 text-center">
                <div className={`font-display text-5xl leading-none ${verdictColor}`}>
                  {result.verdict}
                </div>
                <div className="mt-1 text-xs text-muted">
                  Sell Verdict · Score: <span className="text-white">{result.total_score}/10</span> ·
                  Confidence: <span className="text-white">{result.confidence}%</span>
                </div>
                <div className="mt-1 font-mono text-[10px] text-muted">
                  {result.mode === 'api' ? 'AI Mode' : 'Fallback Mode'}
                </div>
              </div>

              {/* Scores */}
              <div className="space-y-1.5">
                {Object.entries(result.scores).map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between border-b border-white/[0.07] py-1.5 text-xs"
                  >
                    <span className="capitalize text-muted">{k.replace(/_/g, ' ')}</span>
                    <span className="font-mono text-brand-yellow">{v}/10</span>
                  </div>
                ))}
              </div>

              {/* Niche & keywords */}
              <div className="rounded-lg bg-ink-800 p-3.5">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  💡 Suggested Niche
                </div>
                <div className="mb-3 text-sm font-semibold">{result.suggested_niche}</div>

                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  🔑 Keywords
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.suggested_keywords.map((k) => (
                    <span key={k} className="rounded bg-ink-700 px-2 py-1 text-[11px]">
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div className="rounded-lg border border-brand-red/30 bg-brand-red/5 p-3 text-xs">
                  <div className="mb-1 font-bold text-brand-red-3">⚠️ Warnings</div>
                  <ul className="list-disc pl-4 text-muted">
                    {result.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              <div className="rounded-lg border border-brand-blue/30 bg-brand-blue/5 p-3 text-xs">
                <div className="mb-1 font-bold text-brand-blue-3">💡 Improvements</div>
                <ul className="list-disc pl-4 text-muted">
                  {result.improvements.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>

              {/* Send to SEO */}
              <ActionButton variant="yellow" onClick={sendToSEO}>
                📝 Send to SEO Listing →
              </ActionButton>
            </div>
          )}
        </InfoPanel>
      </div>
    </Section>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      resolve(res.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
