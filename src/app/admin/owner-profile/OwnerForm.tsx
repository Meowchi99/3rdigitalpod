'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  ActionButton,
  Field,
  InfoPanel,
  TextareaField,
  showToast,
} from '@/components/ui';
import ImageUpload from '@/components/ui/ImageUpload';
import type { OwnerProfile } from '@/types';

interface Props {
  initial: OwnerProfile | null;
}

/**
 * Single-owner edit form.
 * Always updates the id=1 singleton — never creates new rows.
 */
export default function OwnerForm({ initial }: Props) {
  const supabase = createClient();
  const [owner, setOwner] = useState<Partial<OwnerProfile>>(initial ?? {});
  const [busy, setBusy] = useState(false);

  function set<K extends keyof OwnerProfile>(key: K, value: OwnerProfile[K] | null) {
    setOwner((o) => ({ ...o, [key]: value as OwnerProfile[K] }));
  }

  function setNumber(key: 'total_revenue' | 'monthly_revenue', raw: string) {
    if (raw === '') return set(key, null);
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    set(key, n);
  }

  async function save() {
    if (!owner.owner_name || !owner.owner_name.trim()) {
      return showToast('⚠️ กรุณากรอกชื่อ Owner');
    }
    setBusy(true);
    try {
      const payload = {
        owner_name: owner.owner_name.trim(),
        profile_image_url: owner.profile_image_url ?? null,
        intro: owner.intro ?? null,
        story: owner.story ?? null,
        story_image_url: owner.story_image_url ?? null,
        total_revenue: owner.total_revenue ?? null,
        monthly_revenue: owner.monthly_revenue ?? null,
        revenue_note: owner.revenue_note ?? null,
      };

      // Try UPDATE first; if no row exists yet, UPSERT the singleton.
      const { error: upErr, data: upData } = await supabase
        .from('owner_profile')
        .update(payload)
        .eq('id', 1)
        .select('id')
        .maybeSingle();

      if (upErr) throw upErr;

      if (!upData) {
        const { error: insErr } = await supabase
          .from('owner_profile')
          .insert({ id: 1, ...payload });
        if (insErr) throw insErr;
      }

      showToast('✅ บันทึกสำเร็จ');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'unknown error';
      showToast('❌ บันทึกล้มเหลว: ' + msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-widest">👤 EDIT OWNER</h1>
          <p className="mt-1 text-sm text-muted">
            ข้อมูลของเจ้าของเว็บ · มีได้ 1 คนเท่านั้น
          </p>
        </div>
        <ActionButton variant="primary" onClick={save} disabled={busy}>
          {busy ? '⏳ กำลังบันทึก...' : '💾 บันทึก'}
        </ActionButton>
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px,1fr]">
        {/* LEFT — profile image + name */}
        <div className="space-y-5">
          <InfoPanel title="รูปโปรไฟล์">
            <ImageUpload
              value={owner.profile_image_url ?? null}
              onChange={(url) => set('profile_image_url', url)}
              bucket="owner-assets"
              folder="profile"
              aspectClass="aspect-square"
              allowUrlInput
            />
          </InfoPanel>

          <InfoPanel title="ชื่อ Owner">
            <Field
              label="Owner Name"
              value={owner.owner_name ?? ''}
              onChange={(e) => set('owner_name', e.target.value)}
              placeholder="เช่น 3R Digital Lab"
            />
          </InfoPanel>
        </div>

        {/* RIGHT — text fields */}
        <div className="space-y-5">
          <InfoPanel title="Intro (คำแนะนำตัวสั้น)">
            <TextareaField
              label="Intro"
              rows={3}
              value={owner.intro ?? ''}
              onChange={(e) => set('intro', e.target.value)}
              placeholder="คำแนะนำตัวสั้น ๆ โชว์บนหน้า owner ข้างรูปโปรไฟล์"
            />
          </InfoPanel>

          <InfoPanel title="Story / Background (ประวัติ)">
            <TextareaField
              label="Story"
              rows={10}
              value={owner.story ?? ''}
              onChange={(e) => set('story', e.target.value)}
              placeholder="เล่าเรื่องราวเบื้องหลัง / ประวัติการทำ POD / จุดเริ่มต้น ฯลฯ"
            />
            <div className="mt-4">
              <ImageUpload
                value={owner.story_image_url ?? null}
                onChange={(url) => set('story_image_url', url)}
                bucket="owner-assets"
                folder="story"
                label="รูปประกอบ Story"
                aspectClass="aspect-[16/9]"
                allowUrlInput
              />
            </div>
          </InfoPanel>

          <InfoPanel
            title="💰 Revenue / Income"
            subtitle="แสดงที่หน้า Owner — เว้นว่างเพื่อไม่โชว์"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Total Revenue (USD)"
                type="number"
                step="0.01"
                value={owner.total_revenue ?? ''}
                onChange={(e) => setNumber('total_revenue', e.target.value)}
                placeholder="เช่น 125000"
              />
              <Field
                label="Monthly Revenue (USD)"
                type="number"
                step="0.01"
                value={owner.monthly_revenue ?? ''}
                onChange={(e) => setNumber('monthly_revenue', e.target.value)}
                placeholder="เช่น 8500"
              />
            </div>
            <div className="mt-4">
              <Field
                label="Revenue Note"
                value={owner.revenue_note ?? ''}
                onChange={(e) => set('revenue_note', e.target.value)}
                placeholder='เช่น "Updated monthly" หรือ "YTD 2026"'
              />
            </div>
          </InfoPanel>
        </div>
      </div>

      <div className="mt-6 text-right">
        <ActionButton variant="primary" onClick={save} disabled={busy}>
          {busy ? '⏳ กำลังบันทึก...' : '💾 บันทึกทั้งหมด'}
        </ActionButton>
      </div>
    </div>
  );
}
