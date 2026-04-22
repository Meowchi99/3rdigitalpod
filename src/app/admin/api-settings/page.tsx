'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ActionButton, InfoPanel, showToast } from '@/components/ui';
import type { ApiSetting } from '@/types';

export default function AdminApiSettings() {
  const supabase = createClient();
  const [settings, setSettings] = useState<ApiSetting[]>([]);

  async function load() {
    const { data } = await supabase.from('api_settings').select('*').order('provider_name');
    setSettings((data || []) as ApiSetting[]);
  }
  useEffect(() => { load(); }, []);

  async function toggle(id: string, enabled: boolean) {
    await supabase.from('api_settings').update({ is_enabled: enabled, status: enabled ? 'enabled' : 'disabled' }).eq('id', id);
    showToast(enabled ? '✅ Enabled' : '⏸ Disabled');
    load();
  }

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl tracking-widest">🔑 API SETTINGS</h1>
      <p className="mb-6 text-sm text-muted">
        เปิด/ปิด provider flags — ค่า API key จริงอยู่ใน environment variables บน server
      </p>

      <div className="space-y-3">
        {settings.map((s) => (
          <InfoPanel key={s.id}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-bold capitalize">{s.provider_name}</div>
                <div className="mt-1 font-mono text-xs text-muted">
                  status: {s.status} · enabled: {String(s.is_enabled)}
                </div>
              </div>
              <ActionButton
                variant={s.is_enabled ? 'secondary' : 'primary'}
                onClick={() => toggle(s.id, !s.is_enabled)}
              >
                {s.is_enabled ? '⏸ Disable' : '▶️ Enable'}
              </ActionButton>
            </div>
          </InfoPanel>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-brand-yellow/30 bg-brand-yellow/5 p-4 text-xs leading-relaxed text-muted">
        💡 <span className="font-bold text-brand-yellow">Important:</span> API keys จริง (
        <code className="rounded bg-ink-800 px-1">OPENAI_API_KEY</code>,{' '}
        <code className="rounded bg-ink-800 px-1">GEMINI_API_KEY</code>) เก็บใน{' '}
        <code className="rounded bg-ink-800 px-1">.env.local</code> หรือ Vercel env vars
        — ไม่เก็บใน database เพื่อความปลอดภัย
      </div>
    </div>
  );
}
