'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ActionButton, Field, InfoPanel, Section, SelectField, showToast } from '@/components/ui';
import type { ListingEngineOutput } from '@/types';

export default function SEOListingPage() {
  const params = useSearchParams();
  const [niche, setNiche] = useState(params.get('niche') || '');
  const [productType, setProductType] = useState('T-Shirt');
  const [audience, setAudience] = useState('');
  const [occasion, setOccasion] = useState('Everyday');
  const [result, setResult] = useState<ListingEngineOutput | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (params.get('niche')) setNiche(params.get('niche') || '');
  }, [params]);

  async function run() {
    if (!niche.trim()) return showToast('⚠️ กรุณากรอก Niche');
    setBusy(true);
    try {
      const res = await fetch('/api/listing/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, product_type: productType, audience, occasion }),
      }).then((r) => r.json());
      setResult(res);
    } catch {
      showToast('❌ Failed');
    } finally {
      setBusy(false);
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => showToast('📋 Copied!'));
  }

  return (
    <Section title="📝 SEO LISTING GENERATOR" subtitle="สร้าง Listing ครบตามกฎ Amazon Merch">
      <div className="grid gap-5 md:grid-cols-2">
        <InfoPanel title="📋 Input">
          <div className="flex flex-col gap-3.5">
            <Field label="Niche" value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="เช่น Nurse Life, Dog Mom..." />
            <SelectField label="Product Type" value={productType} onChange={(e) => setProductType(e.target.value)}>
              <option>T-Shirt</option>
              <option>Hoodie</option>
              <option>Long Sleeve</option>
              <option>Tank Top</option>
              <option>V-Neck</option>
            </SelectField>
            <Field label="Target Audience" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="เช่น nurses, dog lovers, teachers..." />
            <SelectField label="Occasion" value={occasion} onChange={(e) => setOccasion(e.target.value)}>
              {['Everyday', 'Birthday', 'Christmas', "Mother's Day", "Father's Day", 'Halloween', 'Valentine', 'Thanksgiving'].map((o) => <option key={o}>{o}</option>)}
            </SelectField>
            <ActionButton variant="generate" onClick={run} disabled={busy}>
              {busy ? '⏳ Generating...' : '✨ Generate SEO Listing'}
            </ActionButton>
          </div>
        </InfoPanel>

        <InfoPanel title="📝 Output">
          {!result ? (
            <div className="py-12 text-center text-sm text-muted">กรอกข้อมูลและกด Generate...</div>
          ) : (
            <div className="flex flex-col gap-3">
              <ListingField label={`Brand (${result.brand.length}/50)`} value={result.brand} onCopy={() => copy(result.brand)} />
              <ListingField label={`Title (${result.title.length}/60)`} value={result.title} onCopy={() => copy(result.title)} />
              <ListingField label={`Bullet 1 (${result.bullet_1.length}/250)`} value={result.bullet_1} onCopy={() => copy(result.bullet_1)} />
              <ListingField label={`Bullet 2 (${result.bullet_2.length}/250)`} value={result.bullet_2} onCopy={() => copy(result.bullet_2)} />
              <ListingField label={`Description (${result.description.length}/2000)`} value={result.description} onCopy={() => copy(result.description)} />
              <div>
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">🔑 SEO Keywords</div>
                <div className="flex flex-wrap gap-1.5">
                  {result.seo_keywords.map((k) => (
                    <span key={k} className="rounded bg-ink-800 px-2 py-1 text-[11px]">{k}</span>
                  ))}
                </div>
              </div>
              <ActionButton
                variant="yellow"
                onClick={() => copy([result.brand, result.title, result.bullet_1, result.bullet_2, result.description].join('\n\n'))}
              >
                📋 Copy All
              </ActionButton>
            </div>
          )}
        </InfoPanel>
      </div>
    </Section>
  );
}

function ListingField({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted">
        <span>{label}</span>
        <button onClick={onCopy} className="text-brand-blue-3 hover:underline normal-case">Copy</button>
      </div>
      <div className="rounded-lg bg-ink-800 p-3 font-mono text-xs leading-relaxed">{value}</div>
    </div>
  );
}
