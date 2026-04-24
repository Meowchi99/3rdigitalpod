'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { showToast } from './index';

interface ImageUploadProps {
  /** Current image URL (if any) */
  value: string | null | undefined;
  /** Called after a successful upload (or when URL is cleared / typed manually) */
  onChange: (url: string | null) => void;
  /** Supabase Storage bucket — defaults to owner-assets */
  bucket?: string;
  /** Subfolder inside the bucket — e.g. "profile" or "story" or "sold-designs" */
  folder?: string;
  /** Label shown above the control */
  label?: string;
  /** Aspect-ratio utility class — e.g. "aspect-square", "aspect-[4/3]" */
  aspectClass?: string;
  /** Show optional manual-URL input as fallback */
  allowUrlInput?: boolean;
}

/**
 * ImageUpload — reusable uploader for Supabase Storage.
 *
 * 1. Uploads the selected file to `{bucket}/{folder}/{timestamp}-{filename}`
 * 2. Returns the public URL via `onChange`
 * 3. Optional: also lets the user paste a URL manually (for remote images)
 */
export default function ImageUpload({
  value,
  onChange,
  bucket = 'owner-assets',
  folder = 'misc',
  label,
  aspectClass = 'aspect-square',
  allowUrlInput = false,
}: ImageUploadProps) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('❌ ไฟล์ใหญ่เกิน 5MB');
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const safe = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 40) || 'img';
      const path = `${folder}/${Date.now()}-${safe}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (upErr) {
        showToast('❌ อัปโหลดล้มเหลว: ' + upErr.message);
        return;
      }

      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(pub.publicUrl);
      showToast('✅ อัปโหลดสำเร็จ');
    } catch (e) {
      showToast('❌ เกิดข้อผิดพลาด');
      console.error(e);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          {label}
        </label>
      )}

      <div
        className={`relative overflow-hidden rounded-xl border border-white/[0.07] bg-ink-800 ${aspectClass}`}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            <div className="text-center">
              <div className="text-3xl">🖼️</div>
              <div className="mt-1 text-xs">ยังไม่มีรูป</div>
            </div>
          </div>
        )}

        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-white">
            ⏳ กำลังอัปโหลด...
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="rounded-md border border-white/[0.07] bg-ink-800 px-3 py-1.5 text-xs text-white hover:border-brand-yellow/40 disabled:opacity-50"
        >
          📤 {value ? 'เปลี่ยนรูป' : 'อัปโหลดรูป'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={busy}
            className="rounded-md border border-red-900/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-900/20 disabled:opacity-50"
          >
            🗑 ลบรูป
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {allowUrlInput && (
        <input
          type="url"
          placeholder="หรือวาง URL รูปภาพ (optional)"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="rounded-lg border border-white/[0.07] bg-ink-800 px-3 py-2 text-xs text-white outline-none focus:border-brand-blue/50"
        />
      )}
    </div>
  );
}
