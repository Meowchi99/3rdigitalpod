import { createClient } from '@/lib/supabase/server';
import { InfoPanel } from '@/components/ui';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminLogsPage() {
  const supabase = await createClient();
  const [{ data: usage }, { data: analyses }] = await Promise.all([
    supabase.from('usage_logs').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('design_analysis_logs').select('*').order('created_at', { ascending: false }).limit(20),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-3xl tracking-widest">📜 LOGS & USAGE</h2>

      <InfoPanel title={`📊 Recent Usage (${usage?.length || 0})`}>
        {!usage || usage.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted">ยังไม่มี usage</div>
        ) : (
          <div className="divide-y divide-white/[0.07]">
            {usage.map((u) => (
              <div key={u.id} className="flex items-center gap-3 py-2.5 text-xs">
                <span className="font-mono text-muted">{formatDate(u.usage_date)}</span>
                <span className="flex-1 font-mono text-white">{u.action_name}</span>
                <span className="rounded bg-ink-800 px-2 py-0.5 font-mono text-brand-yellow">×{u.usage_count}</span>
                <span className="hidden font-mono text-[10px] text-muted sm:inline">{u.user_id.slice(0, 8)}…</span>
              </div>
            ))}
          </div>
        )}
      </InfoPanel>

      <InfoPanel title={`🔬 Recent Design Analyses (${analyses?.length || 0})`}>
        {!analyses || analyses.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted">ยังไม่มี analysis</div>
        ) : (
          <div className="divide-y divide-white/[0.07]">
            {analyses.map((a) => {
              const r = a.result_json as { verdict?: string; total_score?: number; suggested_niche?: string };
              return (
                <div key={a.id} className="flex items-center gap-3 py-2.5 text-xs">
                  <span className="font-mono text-muted">{formatDate(a.created_at)}</span>
                  <span className="flex-1 font-mono text-white">{r.suggested_niche || '—'}</span>
                  <span className="rounded bg-ink-800 px-2 py-0.5 font-mono text-brand-yellow">{r.total_score}/10</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    r.verdict === 'YES' ? 'bg-brand-blue/20 text-brand-blue-3' :
                    r.verdict === 'MAYBE' ? 'bg-brand-yellow/15 text-brand-yellow' :
                    'bg-brand-red/20 text-brand-red-3'
                  }`}>
                    {r.verdict || '?'}
                  </span>
                  <span className="rounded bg-ink-800 px-2 py-0.5 font-mono text-[10px] text-muted">{a.mode_used}</span>
                </div>
              );
            })}
          </div>
        )}
      </InfoPanel>
    </div>
  );
}
