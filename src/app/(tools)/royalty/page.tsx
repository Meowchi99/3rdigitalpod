'use client';

import { useMemo, useState } from 'react';
import { Field, InfoPanel, Pill, Section, SelectField } from '@/components/ui';

const PRODUCTS = [
  { name: 'Standard T-Shirt', rate: 0.13 },
  { name: 'Premium T-Shirt', rate: 0.12 },
  { name: 'Hoodie', rate: 0.14 },
  { name: 'Sweatshirt', rate: 0.13 },
  { name: 'Long Sleeve', rate: 0.13 },
  { name: 'V-Neck', rate: 0.13 },
  { name: 'Tank Top', rate: 0.13 },
  { name: 'Tote Bag', rate: 0.10 },
  { name: 'Throw Pillow', rate: 0.09 },
  { name: 'PopSocket', rate: 0.10 },
];

const MARKETS = [
  { flag: '🇺🇸', name: 'USA', mul: 1.0 },
  { flag: '🇬🇧', name: 'UK', mul: 0.95 },
  { flag: '🇩🇪', name: 'Germany', mul: 0.95 },
  { flag: '🇫🇷', name: 'France', mul: 0.9 },
  { flag: '🇮🇹', name: 'Italy', mul: 0.9 },
  { flag: '🇪🇸', name: 'Spain', mul: 0.9 },
  { flag: '🇯🇵', name: 'Japan', mul: 0.85 },
];

export default function RoyaltyPage() {
  const [price, setPrice] = useState('19.99');
  const [productIdx, setProductIdx] = useState(0);
  const [color, setColor] = useState<'light' | 'dark'>('light');
  const [marketIdx, setMarketIdx] = useState(0);

  const product = PRODUCTS[productIdx];
  const market = MARKETS[marketIdx];

  const { royalty, royaltyPct, goal10, goal50 } = useMemo(() => {
    const p = parseFloat(price) || 0;
    const colorAdj = color === 'dark' ? 0.9 : 0.95;
    const r = p * product.rate * market.mul * colorAdj;
    return {
      royalty: r,
      royaltyPct: Math.round(product.rate * market.mul * 100),
      goal10: r * 10,
      goal50: r * 50,
    };
  }, [price, product, market, color]);

  return (
    <Section title="💰 ROYALTY CALCULATOR" subtitle="คำนวณ Royalty ต่อชิ้นสำหรับทุก Marketplace">
      <InfoPanel title="💰 Royalty Calculator" subtitle="เลือกสินค้า, สี, marketplace และตั้งราคา">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-3.5">
            <Field label="Price (USD)" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
            <SelectField
              label="Product Type"
              value={String(productIdx)}
              onChange={(e) => setProductIdx(parseInt(e.target.value))}
            >
              {PRODUCTS.map((p, i) => (
                <option key={i} value={i}>{p.name}</option>
              ))}
            </SelectField>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">Color Type</label>
              <div className="flex gap-2">
                <Pill color="yellow" active={color === 'light'} onClick={() => setColor('light')}>☀️ Light Colors</Pill>
                <Pill color="yellow" active={color === 'dark'} onClick={() => setColor('dark')}>🌑 Dark Colors</Pill>
              </div>
            </div>
            <SelectField
              label="Marketplace"
              value={String(marketIdx)}
              onChange={(e) => setMarketIdx(parseInt(e.target.value))}
            >
              {MARKETS.map((m, i) => (
                <option key={i} value={i}>{m.flag} {m.name}</option>
              ))}
            </SelectField>
          </div>
          <div>
            <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-brand-red/5 via-transparent to-brand-blue/5 p-6 text-center">
              <div className="bg-gradient-to-r from-brand-yellow to-brand-yellow-2 bg-clip-text font-display text-5xl leading-none text-transparent">
                ${royalty.toFixed(2)}
              </div>
              <div className="mt-1 text-xs text-muted">Royalty per Sale</div>
              <div className="mt-2 text-sm text-brand-blue-3">
                {royaltyPct}% · เป้า 10 ชิ้น/เดือน: <strong>${goal10.toFixed(2)}</strong>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-white/[0.07] bg-ink-800 p-3 text-center">
                <div className="text-[11px] text-muted">Target 50 sales</div>
                <div className="font-mono text-lg font-bold text-brand-blue-3">${goal50.toFixed(2)}</div>
              </div>
              <div className="rounded-lg border border-white/[0.07] bg-ink-800 p-3 text-center">
                <div className="text-[11px] text-muted">Royalty %</div>
                <div className="font-mono text-lg font-bold text-brand-yellow">{royaltyPct}%</div>
              </div>
            </div>
          </div>
        </div>
      </InfoPanel>
    </Section>
  );
}
