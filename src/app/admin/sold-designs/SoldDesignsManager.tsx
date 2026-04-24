'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  ActionButton,
  Field,
  InfoPanel,
  showToast,
} from '@/components/ui';
import ImageUpload from '@/components/ui/ImageUpload';
import type { SoldDesign } from '@/types';

interface Props {
  initial: SoldDesign[];
}

type Editing = Partial<SoldDesign> | null;

export default function SoldDesignsManager({ initial }: Props) {
  const supabase = createClient();
  const [list, setList] = useState<SoldDesign[]>(initial);
  const [editing, setEditing] = useState<Editing>(null);
  const [busy, setBusy] = useState(false);

  async function reload() {
    const { data } = await supabase
      .from('sold_designs')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    setList((data as SoldDesign[] | null) ?? []);
  }

  async function save() {
    if (!editing?.title || !editing.title.trim()) {
      return showToast('⚠️ กรุณากรอก Title');
    }
    setBusy(true);
    try {
      const payload = {
        title: editing.title.trim(),
        image_url: editing.image_url ?? null,
        niche: editing.niche ?? null,
        badge_text: editing.badge_text ?? null,
        sort_order: editing.sort_order ?? list.length + 1,
        is_visible: editing.is_visible ?? true,
      };

      if (editing.id) {
        const { error } = await supabase
          .from('sold_designs')
          .update(payload)
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('sold_designs').insert(payload);
        if (error) throw error;
      }

      showToast('✅ บันทึกสำเร็จ');
      setEditing(null);
      await reload();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'unknown';
      showToast('❌ บันทึกล้มเหลว: ' + msg);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('ลบ sold design นี้?')) return;
    const { error } = await supabase.from('sold_designs').delete().eq('id', id);
    if (error) return showToast('❌ ลบไม่สำเร็จ: ' + error.message);
    showToast('🗑 Deleted');
    await reload();
  }

  async function toggleVisible(row: SoldDesign) {
    const { error } = await supabase
      .from('sold_designs')
      .update({ is_visible: !row.is_visible })
      .eq('id', row.id);
    if (error) return showToast('❌ ' + error.message);
    await reload();
  }

  async function move(row: SoldDesign, direction: -1 | 1) {
    const sorted = [...list].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((x) => x.id === row.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];

    const a = await supabase
      .from('sold_designs')
      .update({ sort_order: other.sort_order })
      .eq('id', row.id);
    const b = await supabase
      .from('sold_designs')
      .update({ sort_order: row.sort_order })
      .eq('id', other.id);
    if (a.error || b.error) {
      return showToast('❌ จัดเรียงไม่สำเร็จ');
    }
    await reload();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-widest">
            🏆 MANAGE SOLD DESIGNS
          </h1>
          <p className="mt-1 text-sm text-muted">
            {list.length} รายการ · โชว์บนหน้า Home เป็น social proof
          </p>
        </div>
        <ActionButton
          variant="primary"
          onClick={() =>
            setEditing({
              title: '',
              niche: '',
              badge_text: 'BEST SELLER',
              sort_order: list.length + 1,
              is_visible: true,
            })
          }
        >
          + เพิ่มใหม่
        </ActionButton>
      </div>

      {editing && (
        <InfoPanel
          title={editing.id ? 'แก้ไข Sold Design' : 'เพิ่ม Sold Design ใหม่'}
          className="mb-6"
        >
          <div className="grid gap-5 lg:grid-cols-[260px,1fr]">
            <ImageUpload
              value={editing.image_url ?? null}
              onChange={(url) => setEditing({ ...editing, image_url: url })}
              bucket="owner-assets"
              folder="sold-designs"
              label="รูปผลงาน"
              aspectClass="aspect-square"
              allowUrlInput
            />

            <div className="grid gap-3.5 md:grid-cols-2">
              <Field
                label="Title"
                value={editing.title ?? ''}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="เช่น Nurse Life Vintage Tee"
              />
              <Field
                label="Niche"
                value={editing.niche ?? ''}
                onChange={(e) => setEditing({ ...editing, niche: e.target.value })}
                placeholder="เช่น Healthcare"
              />
              <Field
                label="Badge Text"
                value={editing.badge_text ?? ''}
                onChange={(e) =>
                  setEditing({ ...editing, badge_text: e.target.value })
                }
                placeholder="BEST SELLER / TOP / HOT"
              />
              <Field
                label="Sort Order"
                type="number"
                value={String(editing.sort_order ?? 0)}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    sort_order: parseInt(e.target.value) || 0,
                  })
                }
              />
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editing.is_visible ?? true}
                    onChange={(e) =>
                      setEditing({ ...editing, is_visible: e.target.checked })
                    }
                    className="accent-brand-yellow"
                  />
                  Visible (แสดงบนหน้า Home)
                </label>
              </div>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
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
        {list.map((d) => (
          <div
            key={d.id}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-white/[0.07] bg-ink-900 p-3"
          >
            <div className="w-10 text-center font-mono text-xs text-muted">
              #{d.sort_order}
            </div>

            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-ink-800">
              {d.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={d.image_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-muted">
                  🖼
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold">{d.title}</div>
              <div className="mt-0.5 truncate text-xs text-muted">
                {d.niche || '—'}
              </div>
            </div>

            {d.badge_text && (
              <span className="rounded bg-brand-yellow/15 px-2 py-1 font-mono text-[10px] font-bold text-brand-yellow">
                {d.badge_text}
              </span>
            )}

            <button
              onClick={() => toggleVisible(d)}
              className={`rounded px-2 py-1 text-xs ${
                d.is_visible
                  ? 'text-brand-blue-3 hover:bg-ink-800'
                  : 'text-muted hover:bg-ink-800'
              }`}
              title="Toggle visibility"
            >
              {d.is_visible ? '👁 Live' : '🙈 Hidden'}
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={() => move(d, -1)}
                className="rounded border border-white/[0.07] px-2 py-1 text-xs hover:bg-ink-800"
                title="ขึ้น"
              >
                ↑
              </button>
              <button
                onClick={() => move(d, 1)}
                className="rounded border border-white/[0.07] px-2 py-1 text-xs hover:bg-ink-800"
                title="ลง"
              >
                ↓
              </button>
            </div>

            <button
              onClick={() => setEditing(d)}
              className="rounded border border-white/[0.07] px-2.5 py-1 text-xs hover:bg-ink-800"
            >
              ✏️
            </button>
            <button
              onClick={() => remove(d.id)}
              className="rounded border border-red-900/40 px-2.5 py-1 text-xs text-red-400 hover:bg-red-900/20"
            >
              🗑
            </button>
          </div>
        ))}
        {list.length === 0 && (
          <div className="rounded-lg border border-white/[0.07] bg-ink-900 p-10 text-center text-sm text-muted">
            ยังไม่มี sold designs · กด &quot;+ เพิ่มใหม่&quot; เพื่อเริ่ม
          </div>
        )}
      </div>
    </div>
  );
}
