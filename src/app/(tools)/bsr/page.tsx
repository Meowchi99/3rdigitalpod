'use client';

import { useMemo, useState } from 'react';
import { ActionButton, Field, InfoPanel, Section, SelectField } from '@/components/ui';

const CATEGORIES: Record<string, { mul: number; royaltyPct: number; label: string }> = {
  tshirt: { mul: 0.00018, royaltyPct: 0.13, label: 'T-Shirts (Novelty)' },
  hoodie: { mul: 0.00012, royaltyPct: 0.14, label: 'Hoodies / Sweatshirts' },
  tote:   { mul: 0.00025, royaltyPct: 0.10, label: 'Tote Bags' },
  mug:    { mul: 0.0003,  royaltyPct: 0.09, label: 'Mugs' },
  phone:  { mul: 0.0002,  royaltyPct: 0.11, label: 'Phone Cases' },
};

const TIER_STEPS = [10, 25, 100, 500, 1000, 2000, 4000, 8000];

export default function BSRPage() {
  const [bsr, setBsr] = useState('50000');
  const [category, setCategory] = useState<keyof typeof CATEGORIES>('tshirt');
  const [price, setPrice] = useState('19.99');
  const [marketplace, setMarketplace] = useState('🇺🇸 USA');

  const result = useMemo(() => {
    const bsrNum = parseInt(bsr) || 0;
    const priceNum = parseFloat(price) || 0;
    const cfg = CATEGORIES[category];
    if (bsrNum <= 0) return null;

    const sales = Math.max(1, Math.round((1_000_000 * cfg.mul) / Math.pow(bsrNum, 0.8)));
    const royalty = priceNum * cfg.royaltyPct * sales;
    const tier = TIER_STEPS.find((t) => t >= sales) || 8000;
    return { sales, royalty: royalty.toFixed(2), tier };
  }, [bsr, category, price, marketplace]);

  return (
    <Section title="📊 BSR → SALES ESTIMATOR" subtitle="ประมาณยอดขายและ Royalty จาก Best Seller Rank">
      <InfoPanel title="📊 BSR Calculator" subtitle="กรอก BSR + ประเภทสินค้า + ราคา → ประมาณยอดขาย/เดือน">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-3.5">
            <Field label="Best Seller Rank (BSR)" type="number" value={bsr} onChange={(e) => setBsr(e.target.value)} />
            <SelectField label="Product Category" value={category} onChange={(e) => setCategory(e.target.value as keyof typeof CATEGORIES)}>
              {Object.entries(CATEGORIES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </SelectField>
            <Field label="Product Price (USD)" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
            <SelectField label="Marketplace" value={marketplace} onChange={(e) => setMarketplace(e.target.value)}>
              <option>🇺🇸 USA</option>
              <option>🇬🇧 UK</option>
              <option>🇩🇪 Germany</option>
            </SelectField>
          </div>
          <div>
            <div className="space-y-2.5">
              <ResultCard label="Est. Sales / Month" value={result ? `${result.sales} units` : '—'} color="red" />
              <ResultCard label="Est. Royalty / Month" value={result ? `$${result.royalty}` : '—'} color="yellow" />
              <ResultCard label="Minimum Tier Needed" value={result ? `Tier ${result.tier}` : '—'} color="blue" />
            </div>
            <div className="mt-4 rounded-lg bg-ink-800 p-3 text-[11px] leading-relaxed text-muted">
              💡 ตัวเลขนี้เป็นการประมาณการจาก algorithm สาธารณะ ไม่ใช่ข้อมูลโดยตรงจาก Amazon
              เป็น order-of-magnitude guide เท่านั้น
            </div>
          </div>
        </div>
      </InfoPanel>
    </Section>
  );
}

function ResultCard({ label, value, color }: { label: string; value: string; color: 'red' | 'yellow' | 'blue' }) {
  const clr = {
    red: 'text-brand-red-3',
    yellow: 'text-brand-yellow',
    blue: 'text-brand-blue-3',
  }[color];
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.07] bg-ink-800 px-4 py-3.5">
      <span className="text-xs text-muted">{label}</span>
      <span className={`font-mono text-lg font-bold ${clr}`}>{value}</span>
    </div>
  );
}
