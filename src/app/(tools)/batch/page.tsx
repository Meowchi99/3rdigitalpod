'use client';

import { useState } from 'react';
import { ActionButton, InfoPanel, Section, TextareaField, showToast } from '@/components/ui';
import type { ListingEngineOutput } from '@/types';

interface BatchRow {
  niche: string;
  status: 'pending' | 'done' | 'error';
  listing?: ListingEngineOutput;
}

export default function BatchPage() {
  const [input, setInput] = useState('Nurse Life\nDog Mom\nMechanic Dad\nFishing Vibes\nTeacher Mode');
  const [rows, setRows] = useState<BatchRow[]>([]);
  const [busy, setBusy] = useState(false);

  async function run() {
    const niches = input.split('\n').map((s) => s.trim()).filter(Boolean);
    if (niches.length === 0) return showToast('⚠️ กรุณากรอก Niches');
    if (niches.length > 20) return showToast('⚠️ จำกัด 20 รายการ/ครั้ง');

    setBusy(true);
    const newRows: BatchRow[] = niches.map((n) => ({ niche: n, status: 'pending' }));
    setRows(newRows);

    try {
      for (let i = 0; i < niches.length; i++) {
        try {
          const res: ListingEngineOutput = await fetch('/api/listing/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ niche: niches[i], product_type: 'T-Shirt' }),
          }).then((r) => r.json());
          newRows[i] = { niche: niches[i], status: 'done', listing: res };
        } catch {
          newRows[i] = { niche: niches[i], status: 'error' };
        }
        setRows([...newRows]);
      }
      showToast(`✅ Completed ${niches.length} items`);
    } finally {
      setBusy(false);
    }
  }

  function exportCSV() {
    if (rows.length === 0) return showToast('⚠️ ไม่มีข้อมูล');
    const headers = ['Niche', 'Brand', 'Title', 'Bullet1', 'Bullet2', 'Description', 'Keywords'];
    const csv = [
      headers.join(','),
      ...rows.filter((r) => r.listing).map((r) => {
        const l = r.listing!;
        return [r.niche, l.brand, l.title, l.bullet_1, l.bullet_2, l.description, l.seo_keywords.join('; ')]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',');
      }),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-listings-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Section title="⚡ BATCH GENERATOR" subtitle="สร้าง Listing หลายรายการพร้อมกัน">
      <InfoPanel title="⚡ Batch Generator" subtitle="วาง Niches หลายบรรทัด (1 ต่อบรรทัด)">
        <TextareaField
          label="Niches / Keywords"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          className="resize-y"
        />
        <div className="mt-4 flex gap-2">
          <ActionButton variant="primary" onClick={run} disabled={busy}>
            {busy ? '⏳ Processing...' : '⚡ Generate All'}
          </ActionButton>
          <ActionButton variant="secondary" onClick={exportCSV} disabled={rows.length === 0}>
            📊 Export CSV
          </ActionButton>
        </div>

        {rows.length > 0 && (
          <div className="mt-5 overflow-hidden rounded-lg border border-white/[0.07]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.07] bg-ink-800 text-left text-muted">
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">Niche</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Title</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-white/[0.07]">
                    <td className="p-2.5 font-mono text-muted">{i + 1}</td>
                    <td className="p-2.5 font-semibold">{r.niche}</td>
                    <td className="p-2.5">
                      {r.status === 'pending' && <span className="text-brand-yellow">⏳ Pending</span>}
                      {r.status === 'done' && <span className="text-brand-blue-3">✓ Done</span>}
                      {r.status === 'error' && <span className="text-brand-red">✗ Error</span>}
                    </td>
                    <td className="max-w-xs truncate p-2.5 text-muted">{r.listing?.title || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </InfoPanel>
    </Section>
  );
}
