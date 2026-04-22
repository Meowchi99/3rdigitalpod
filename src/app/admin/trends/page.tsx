'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ActionButton, Field, InfoPanel, SelectField, showToast } from '@/components/ui';
import type { Trend, TrendType } from '@/types';

export default function AdminTrends() {
  const supabase = createClient();
  const [trends, setTrends] = useState<Trend[]>([]);
  const [editing, setEditing] = useState<Partial<Trend> | null>(null);

  async function load() {
    const { data } = await supabase
      .from('trends')
      .select('*')
      .order('trend_type')
      .order('score', { ascending: false });
    setTrends((data || []) as Trend[]);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing?.keyword) return showToast('⚠️ ใส่ keyword');
    try {
      if (editing.id) {
        await supabase.from('trends').update({
          keyword: editing.keyword,
          category: editing.category,
          score: editing.score ?? 0,
          competition: editing.competition,
          trend_type: editing.trend_type,
          is_featured: editing.is_featured ?? false,
        }).eq('id', editing.id);
      } else {
        await supabase.from('trends').insert({
          keyword: editing.keyword,
          category: editing.category ?? null,
          score: editing.score ?? 0,
          competition: editing.competition ?? null,
          trend_type: (editing.trend_type as TrendType) ?? 'daily',
          is_featured: editing.is_featured ?? false,
        });
      }
      showToast('✅ Saved');
      setEditing(null);
      load();
    } catch {
      showToast('❌ Failed');
    }
  }

  async function remove(id: string) {
    if (!confirm('ลบ?')) return;
    await supabase.from('trends').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-widest">📡 TRENDS</h1>
          <p className="mt-1 text-sm text-muted">{trends.length} รายการ</p>
        </div>
        <ActionButton
          variant="primary"
          onClick={() => setEditing({ keyword: '', trend_type: 'daily', score: 50, is_featured: false })}
        >
          + เพิ่มใหม่
        </ActionButton>
      </div>

      {editing && (
        <InfoPanel title={editing.id ? 'แก้ไข Trend' : 'เพิ่ม Trend'} className="mb-5">
          <div className="grid gap-3.5 md:grid-cols-2">
            <Field label="Keyword" value={editing.keyword || ''} onChange={(e) => setEditing({ ...editing, keyword: e.target.value })} />
            <SelectField label="Type" value={editing.trend_type || 'daily'} onChange={(e) => setEditing({ ...editing, trend_type: e.target.value as TrendType })}>
              <option value="daily">🔥 Daily</option>
              <option value="monthly">📅 Monthly</option>
            </SelectField>
            <Field label="Category" value={editing.category || ''} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
            <Field label="Score (0-100)" type="number" value={String(editing.score ?? 0)} onChange={(e) => setEditing({ ...editing, score: parseFloat(e.target.value) || 0 })} />
            <SelectField label="Competition" value={editing.competition || ''} onChange={(e) => setEditing({ ...editing, competition: e.target.value })}>
              <option value="">—</option>
              <option>Very Low</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </SelectField>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.is_featured ?? false} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} className="accent-brand-yellow" />
                Featured
              </label>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <ActionButton variant="primary" onClick={save}>💾 บันทึก</ActionButton>
            <ActionButton variant="secondary" onClick={() => setEditing(null)}>ยกเลิก</ActionButton>
          </div>
        </InfoPanel>
      )}

      <div className="space-y-2">
        {trends.map((t) => (
          <div key={t.id} className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-ink-900 p-3">
            <span className={`rounded px-2 py-1 font-mono text-[10px] ${t.trend_type === 'daily' ? 'bg-brand-red/15 text-brand-red-3' : 'bg-brand-blue/15 text-brand-blue-3'}`}>
              {t.trend_type.toUpperCase()}
            </span>
            <div className="flex-1">
              <div className="text-sm font-bold">{t.keyword}</div>
              <div className="mt-0.5 text-xs text-muted">{t.category} · {t.competition}</div>
            </div>
            <span className="font-mono text-xs text-brand-yellow">{t.score}</span>
            {t.is_featured && <span className="text-[10px] text-brand-yellow">⭐</span>}
            <button onClick={() => setEditing(t)} className="rounded border border-white/[0.07] px-2.5 py-1 text-xs hover:bg-ink-800">✏️</button>
            <button onClick={() => remove(t.id)} className="rounded border border-red-900/40 px-2.5 py-1 text-xs text-red-400 hover:bg-red-900/20">🗑</button>
          </div>
        ))}
      </div>
    </div>
  );
}
