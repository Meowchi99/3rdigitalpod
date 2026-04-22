import { getCurrentProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Section, InfoPanel } from '@/components/ui';
import type { ApiSetting, ExternalLink as ExtLink } from '@/types';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { data: apiSettings } = await supabase.from('api_settings').select('*');
  const { data: links } = await supabase
    .from('external_links')
    .select('*')
    .order('sort_order');

  const settings = (apiSettings || []) as ApiSetting[];
  const openai = settings.find((s) => s.provider_name === 'openai');
  const gemini = settings.find((s) => s.provider_name === 'gemini');
  const isAdmin = profile?.role === 'owner' || profile?.role === 'admin';

  return (
    <Section title="⚙️ SETTINGS" subtitle="ตั้งค่า API Keys, Provider และ Preferences">
      <div className="mx-auto max-w-3xl">
        {/* Status summary */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <StatusCard
            icon="🤖"
            title="OpenAI"
            status={openai?.is_enabled ? '✅ Configured' : '⚪ Not configured'}
            statusColor={openai?.is_enabled ? 'text-brand-blue-3' : 'text-muted'}
          />
          <StatusCard
            icon="✨"
            title="Gemini"
            status={gemini?.is_enabled ? '✅ Configured' : '⚪ Not configured'}
            statusColor={gemini?.is_enabled ? 'text-brand-blue-3' : 'text-muted'}
          />
          <StatusCard icon="🔄" title="Fallback Mode" status="✅ Enabled" statusColor="text-brand-yellow" />
          <StatusCard
            icon="🌐"
            title="Default Provider"
            status={openai?.is_enabled ? 'OpenAI' : gemini?.is_enabled ? 'Gemini' : 'Mock / Built-in'}
            statusColor="text-white"
          />
        </div>

        {!profile ? (
          <InfoPanel title="🔐 Sign in to customize">
            <p className="mb-4 text-sm text-muted">
              ผู้ใช้ทั่วไปสามารถใช้เครื่องมือทั้งหมดได้แม้ไม่ได้ล็อกอิน
              แต่หากต้องการเซฟผลงานและใช้ API Key ส่วนตัว กรุณาล็อกอิน
            </p>
          </InfoPanel>
        ) : !isAdmin ? (
          <InfoPanel title="🙋 User Settings" subtitle="เฉพาะ admin เท่านั้นที่กำหนด API ได้ — แต่คุณใช้ Fallback Mode ได้ฟรี">
            <p className="text-sm text-muted">
              Provider keys ถูกจัดการแบบ server-side โดย admin เพื่อความปลอดภัย ไม่มีการเก็บ raw API key บน client
            </p>
          </InfoPanel>
        ) : (
          <InfoPanel title="🔑 API Settings (Admin)" subtitle="แก้ไข provider config — key จริงอยู่ใน env vars">
            <div className="space-y-4">
              <div className="rounded-lg border border-white/[0.07] bg-ink-800 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold">OpenAI</div>
                    <div className="mt-0.5 font-mono text-xs text-muted">
                      {openai?.is_enabled ? 'enabled' : 'disabled'} · model: {String((openai?.config_json as Record<string, unknown> | undefined)?.model ?? 'gpt-4o-mini')}
                    </div>
                  </div>
                  <span className={`rounded px-2 py-1 text-xs ${openai?.is_enabled ? 'bg-brand-blue/15 text-brand-blue-3' : 'bg-ink-700 text-muted'}`}>
                    {openai?.status ?? 'not_configured'}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-white/[0.07] bg-ink-800 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold">Gemini</div>
                    <div className="mt-0.5 font-mono text-xs text-muted">
                      {gemini?.is_enabled ? 'enabled' : 'disabled'} · model: {String((gemini?.config_json as Record<string, unknown> | undefined)?.model ?? 'gemini-1.5-flash')}
                    </div>
                  </div>
                  <span className={`rounded px-2 py-1 text-xs ${gemini?.is_enabled ? 'bg-brand-blue/15 text-brand-blue-3' : 'bg-ink-700 text-muted'}`}>
                    {gemini?.status ?? 'not_configured'}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-5 rounded-lg bg-ink-800 p-4 text-xs leading-relaxed text-muted">
              💡 API keys อยู่ใน <code className="rounded bg-ink-700 px-1">.env.local</code> (OPENAI_API_KEY, GEMINI_API_KEY).
              แก้ที่ไฟล์ env แล้ว redeploy — หรือใน Vercel Dashboard → Environment Variables
            </div>
          </InfoPanel>
        )}

        <InfoPanel title="🌐 External Research Links" className="mt-5">
          <div className="space-y-2">
            {(links as ExtLink[] | null)?.map((l) => (
              <div key={l.id} className="flex items-center gap-2">
                <span className="text-lg">{l.icon || '🔗'}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{l.label}</div>
                  <div className="truncate text-xs text-muted">{l.url}</div>
                </div>
              </div>
            ))}
            {(!links || links.length === 0) && <div className="py-4 text-center text-xs text-muted">ยังไม่มีลิงก์</div>}
          </div>
        </InfoPanel>
      </div>
    </Section>
  );
}

function StatusCard({ icon, title, status, statusColor }: { icon: string; title: string; status: string; statusColor: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-ink-900 p-4">
      <span className="text-xl">{icon}</span>
      <div>
        <div className="text-sm font-bold">{title}</div>
        <div className={`mt-0.5 text-xs ${statusColor}`}>{status}</div>
      </div>
    </div>
  );
}
