'use client';

import { useState } from 'react';
import { ActionButton, Field, InfoPanel, Section, showToast } from '@/components/ui';
import type { DesignAnalysisResult, ListingEngineOutput } from '@/types';

export default function ImageListingPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [tags, setTags] = useState('');
  const [listing, setListing] = useState<ListingEngineOutput | null>(null);
  const [analysis, setAnalysis] = useState<DesignAnalysisResult | null>(null);
  const [busy, setBusy] = useState(false);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function run() {
    setBusy(true);
    try {
      let image_base64: string | undefined;
      if (file) image_base64 = await fileToBase64(file);

      const manualTags = tags.split(',').map((t) => t.trim()).filter(Boolean);

      // Step 1: Analyze design to detect niche + keywords
      const analysisRes: DesignAnalysisResult = await fetch('/api/analyze-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64, manual_tags: manualTags }),
      }).then((r) => r.json());
      setAnalysis(analysisRes);

      // Step 2: Generate SEO listing from detected niche
      const listingRes: ListingEngineOutput = await fetch('/api/listing/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: analysisRes.suggested_niche,
          product_type: 'T-Shirt',
          audience: analysisRes.audience,
        }),
      }).then((r) => r.json());
      setListing(listingRes);
    } catch {
      showToast('❌ Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section title="🖼️ IMAGE → LISTING" subtitle="อัปโหลดรูป Design → AI เขียน SEO Listing ให้อัตโนมัติ">
      <div className="grid gap-5 lg:grid-cols-2">
        <InfoPanel title="📤 Upload">
          <div className="flex flex-col gap-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/[0.07] p-8 hover:border-brand-blue/40">
              <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              {preview ? (
                <img src={preview} alt="preview" className="max-h-[220px] rounded-lg" />
              ) : (
                <>
                  <div className="text-4xl">🖼️</div>
                  <div className="mt-2 text-sm text-muted">คลิกเพื่ออัปโหลด Design</div>
                </>
              )}
            </label>
            <Field label="Manual Tags (คั่นด้วย ,)" value={tags} onChange={(e) => setTags(e.target.value)} />
            <ActionButton variant="generate" onClick={run} disabled={busy || !file}>
              {busy ? '⏳ Processing...' : '🤖 Generate Listing from Image'}
            </ActionButton>
          </div>
        </InfoPanel>

        <InfoPanel title="📝 Generated Listing">
          {!listing || !analysis ? (
            <div className="py-12 text-center text-sm text-muted">อัปโหลดรูปและกด Generate...</div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg bg-ink-800 p-3 text-xs">
                <div className="text-muted">🎯 Detected Niche: <span className="text-white">{analysis.suggested_niche}</span></div>
                <div className="mt-1 text-muted">👥 Audience: <span className="text-white">{analysis.audience}</span></div>
              </div>
              <div>
                <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted">Title</div>
                <div className="rounded bg-ink-800 p-2.5 text-sm">{listing.title}</div>
              </div>
              <div>
                <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted">Brand</div>
                <div className="rounded bg-ink-800 p-2.5 text-sm">{listing.brand}</div>
              </div>
              <div>
                <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted">Bullets</div>
                <div className="space-y-2">
                  <div className="rounded bg-ink-800 p-2.5 text-xs leading-relaxed text-muted">• {listing.bullet_1}</div>
                  <div className="rounded bg-ink-800 p-2.5 text-xs leading-relaxed text-muted">• {listing.bullet_2}</div>
                </div>
              </div>
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
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
