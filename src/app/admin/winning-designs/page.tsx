'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ActionButton, Field, InfoPanel, SelectField, showToast } from '@/components/ui';
import type { WinningDesign, BadgeType } from '@/types';

export default function AdminWinningDesigns() {
  const supabase = createClient();
  const [designs, setDesigns] = useState<WinningDesign[]>([]);
  const [editing, setEditing] = useState<Partial<WinningDesign> | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await supabase
      .from('winning_designs')
      .select('*')
      .order('sort_order');
    setDesigns((data || []) as WinningDesign[]);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!editing?.title) return showToast('⚠️ กรุณากรอก Title');
    setBusy(true);
    try {
      if (editing.id) {
        const { error } = await supabase
          .from('winning_designs')
          .update({
            title: editing.title,
            niche: editing.niche,
            main_keyword: editing.main_keyword,
            badge: editing.badge,
            amazon_url: editing.amazon_url,
            image_url: editing.image_url,
            is_published: editing.is_published ?? true,
            sort_order: editing.sort_order ?? 0,
          })
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('winning_designs').insert({
          title: editing.title,
          niche: editing.niche ?? null,
          main_keyword: editing.main_keyword ?? null,
          badge: (editing.badge as BadgeType) ?? 'daily',
          amazon_url: editing.amazon_url ?? null,
          image_url: editing.image_url ?? null,
          is_published: editing.is_published ?? true,
          sort_order: editing.sort_order ?? designs.length + 1,
        });
        if (error) throw error;
      }
      showToast('✅ บันทึกสำเร็จ');
      setEditing(null);
      await load();
    } catch (e) {
      console.error(e);
      showToast('❌ บันทึกล้มเหลว');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('ลบรายการนี้?')) return;
    const { error } = await supabase.from('winning_designs').delete().eq('id', id);
    if (error) return showToast('❌ ลบไม่สำเร็จ');
    showToast('🗑 Deleted');
    await load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-widest">🏆 WINNING DESIGNS</h1>
          <p className="mt-1 text-sm text-muted">{designs.length} รายการ</p>
        </div>
        <ActionButton
          variant="primary"
          onClick={() =>
            setEditing({
              title: '',
              niche: '',
              main_keyword: '',
              badge: 'daily',
              is_published: true,
            })
          }
        >
          + เพิ่มใหม่
        </ActionButton>
      </div>

      {editing && (
        <InfoPanel
          title={editing.id ? 'แก้ไข Winning Design' : 'เพิ่ม Winning Design ใหม่'}
          className="mb-5"
        >
          <div className="grid gap-3.5 md:grid-cols-2">
            <Field
              label="Title"
              value={editing.title || ''}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            />
            <Field
              label="Niche"
              value={editing.niche || ''}
              onChange={(e) => setEditing({ ...editing, niche: e.target.value })}
            />
            <Field
              label="Main Keyword"
              value={editing.main_keyword || ''}
              onChange={(e) => setEditing({ ...editing, main_keyword: e.target.value })}
            />
            <SelectField
              label="Badge"
              value={editing.badge || 'daily'}
              onChange={(e) => setEditing({ ...editing, badge: e.target.value as BadgeType })}
            >
              <option value="daily">🔥 Daily</option>
              <option value="monthly">📅 Monthly</option>
              <option value="evergreen">🌲 Evergreen</option>
            </SelectField>
            <Field
              label="Amazon URL"
              value={editing.amazon_url || ''}
              onChange={(e) => setEditing({ ...editing, amazon_url: e.target.value })}
            />
            <Field
              label="Image URL"
              value={editing.image_url || ''}
              onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
            />
            <Field
              label="Sort Order"
              type="number"
              value={String(editing.sort_order ?? 0)}
              onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })}
            />
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.is_published ?? true}
                  onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })}
                  className="accent-brand-yellow"
                />
                Published
              </label>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <ActionButton variant="primary" onClick={save} disabled={busy}>
              {busy ? '⏳' : '💾'} บันทึก
            </ActionButton>
            <ActionButton variant="secondary" onClick={() => setEditing(null)}>
              ยกเลิก
            </ActionButton>
          </div>
        </InfoPanel>
      )}

      <div className="space-y-2">
        {designs.map((d) => (
          <div key={d.id} className="flex items-center gap-4 rounded-lg border border-white/[0.07] bg-ink-900 p-3">
            <div className="w-10 text-center font-mono text-xs text-muted">#{d.sort_order}</div>
            <div className="flex-1">
              <div className="text-sm font-bold">{d.title}</div>
              <div className="mt-0.5 text-xs text-muted">
                {d.niche} · <span className="text-brand-yellow">{d.main_keyword}</span>
              </div>
            </div>
            <span className={`rounded px-2 py-1 font-mono text-[10px] font-bold ${badgeClass(d.badge)}`}>
              {d.badge.toUpperCase()}
            </span>
            <span className={`text-xs ${d.is_published ? 'text-brand-blue-3' : 'text-muted'}`}>
              {d.is_published ? '✓ Live' : '⏸ Draft'}
            </span>
            <button onClick={() => setEditing(d)} className="rounded border border-white/[0.07] px-2.5 py-1 text-xs hover:bg-ink-800">
              ✏️
            </button>
            <button onClick={() => remove(d.id)} className="rounded border border-red-900/40 px-2.5 py-1 text-xs text-red-400 hover:bg-red-900/20">
              🗑
            </button>
          </div>
        ))}
        {designs.length === 0 && (
          <div className="rounded-lg border border-white/[0.07] bg-ink-900 p-10 text-center text-sm text-muted">
            ยังไม่มี winning designs · กด "+ เพิ่มใหม่" เพื่อเริ่ม
          </div>
        )}
      </div>
    </div>
  );
}

function badgeClass(b: BadgeType): string {
  return b === 'daily'
    ? 'bg-brand-red text-white'
    : b === 'monthly'
    ? 'bg-brand-blue text-white'
    : 'bg-ink-800 text-brand-yellow border border-brand-yellow/30';
}
