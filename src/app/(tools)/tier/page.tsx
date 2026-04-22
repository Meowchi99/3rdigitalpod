'use client';

import { useMemo, useState } from 'react';
import { Field, InfoPanel, Section, SelectField } from '@/components/ui';

const TIER_NEXT: Record<number, number | null> = {
  10: 25, 25: 100, 100: 500, 500: 1000, 1000: 2000, 2000: 4000, 4000: 8000, 8000: null,
};

export default function TierPage() {
  const [currentTier, setCurrentTier] = useState(10);
  const [designs, setDesigns] = useState('0');
  const [sales, setSales] = useState('0');

  const { pct, message } = useMemo(() => {
    const d = parseInt(designs) || 0;
    const s = parseInt(sales) || 0;
    const percentage = Math.min(100, Math.round((d / currentTier) * 100));
    const next = TIER_NEXT[currentTier];
    const remaining = currentTier - d;

    const lines: string[] = [
      `Tier ${currentTier} | Designs: ${d}/${currentTier} (${percentage}%) | Slots remaining: ${Math.max(0, remaining)}`,
      `Monthly sales: ${s}`,
    ];
    if (next) {
      lines.push(`Next: Tier ${next} — ต้องการขายให้ถึงเกณฑ์เพื่อให้ Amazon ปลดล็อก`);
    } else {
      lines.push(`🎉 You're at the maximum tier!`);
    }
    if (percentage < 70) {
      lines.push(`⚠️ เติม Design ให้ถึง ${Math.round(currentTier * 0.8)}+ slots เพื่อแสดง Amazon ว่า account นี้ active`);
    }
    return { pct: percentage, message: lines.join('\n') };
  }, [currentTier, designs, sales]);

  return (
    <Section title="📈 TIER TRACKER" subtitle="ติดตามความคืบหน้า Tier และดูว่าต้องทำอะไรต่อ">
      <div className="mx-auto max-w-2xl">
        <InfoPanel title="📈 Tier Progress">
          <div className="flex flex-col gap-3.5">
            <SelectField
              label="Current Tier"
              value={String(currentTier)}
              onChange={(e) => setCurrentTier(parseInt(e.target.value))}
            >
              {Object.keys(TIER_NEXT).map((t) => (
                <option key={t} value={t}>Tier {t}</option>
              ))}
            </SelectField>
            <Field label="Active Designs" type="number" value={designs} onChange={(e) => setDesigns(e.target.value)} />
            <Field label="Sales This Month" type="number" value={sales} onChange={(e) => setSales(e.target.value)} />
          </div>

          <div className="mt-6">
            <div className="mb-1 flex items-center justify-between text-xs text-muted">
              <span>Tier {currentTier}</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-ink-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-pink transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-4 whitespace-pre-line rounded-lg bg-ink-800 p-4 text-sm leading-relaxed text-muted">
              {message}
            </div>
          </div>
        </InfoPanel>
      </div>
    </Section>
  );
}
