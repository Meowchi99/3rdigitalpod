import { createServiceRoleClient } from '@/lib/supabase/server';
import { InfoPanel } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { PLAN_LIMITS } from '@/lib/auth/usage-limiter';

export const dynamic = 'force-dynamic';

export default async function AdminUsagePage() {
  // Service-role to aggregate across all users (admin already verified by middleware)
  const supabase = createServiceRoleClient();

  const today = new Date().toISOString().split('T')[0];
  const last7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [{ data: todayUsage }, { data: weekUsage }, { data: users }, { data: packs }] = await Promise.all([
    supabase.from('usage_logs').select('*').eq('usage_date', today),
    supabase.from('usage_logs').select('*').gte('usage_date', last7).order('created_at', { ascending: false }).limit(200),
    supabase.from('profiles').select('id, email, plan, role'),
    supabase
      .from('saved_outputs')
      .select('id, user_id, output_type, title, created_at')
      .order('created_at', { ascending: false })
      .limit(30),
  ]);

  // Aggregate today by action
  const todayByAction: Record<string, number> = {};
  (todayUsage || []).forEach((u: { action_name: string; usage_count: number }) => {
    todayByAction[u.action_name] = (todayByAction[u.action_name] || 0) + u.usage_count;
  });

  // Aggregate by user (top users today)
  const userMap = new Map<string, string>();
  (users || []).forEach((u: { id: string; email: string }) => userMap.set(u.id, u.email));
  const userUsage: Record<string, number> = {};
  (todayUsage || []).forEach((u: { user_id: string; usage_count: number }) => {
    userUsage[u.user_id] = (userUsage[u.user_id] || 0) + u.usage_count;
  });
  const topUsers = Object.entries(userUsage)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  // Plan distribution
  const planDist: Record<string, number> = { free: 0, pro: 0, elite: 0 };
  (users || []).forEach((u: { plan: string }) => {
    planDist[u.plan] = (planDist[u.plan] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <h2 className="font-display text-3xl tracking-widest">📊 USAGE DASHBOARD</h2>

      {/* Headline stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatBox label="Total Users" value={users?.length || 0} color="blue" />
        <StatBox label="Today's Actions" value={todayUsage?.reduce((s: number, u: { usage_count: number }) => s + u.usage_count, 0) || 0} color="yellow" />
        <StatBox label="Pro + Elite" value={(planDist.pro || 0) + (planDist.elite || 0)} color="pink" />
        <StatBox label="Saved Packs (30d)" value={packs?.length || 0} color="red" />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <InfoPanel title="📈 Today by Action">
          <div className="space-y-2">
            {Object.entries(todayByAction).length === 0 && (
              <div className="py-4 text-center text-sm text-muted">ยังไม่มี usage วันนี้</div>
            )}
            {Object.entries(todayByAction).map(([action, count]) => (
              <div key={action} className="flex items-center justify-between border-b border-white/[0.07] py-2 text-sm">
                <span className="font-mono text-xs">{action}</span>
                <span className="font-mono font-bold text-brand-yellow">{count}</span>
              </div>
            ))}
          </div>
        </InfoPanel>

        <InfoPanel title="👥 Plan Distribution">
          <div className="space-y-2">
            {(['free', 'pro', 'elite'] as const).map((plan) => (
              <div key={plan} className="flex items-center justify-between border-b border-white/[0.07] py-2">
                <div>
                  <span className="text-sm font-bold capitalize">{plan}</span>
                  <div className="font-mono text-[10px] text-muted">
                    Limit: {PLAN_LIMITS[plan].make_money === 999999 ? '∞' : PLAN_LIMITS[plan].make_money}/day · make_money
                  </div>
                </div>
                <span className="font-mono text-lg font-bold">{planDist[plan] || 0}</span>
              </div>
            ))}
          </div>
        </InfoPanel>
      </div>

      <InfoPanel title={`🏆 Top Users Today (${topUsers.length})`}>
        {topUsers.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted">—</div>
        ) : (
          <div className="space-y-2">
            {topUsers.map(([userId, count], i) => (
              <div key={userId} className="flex items-center gap-3 border-b border-white/[0.07] py-2 text-xs">
                <span className="w-6 font-mono font-bold text-muted">#{i + 1}</span>
                <span className="flex-1 truncate font-mono">{userMap.get(userId) || userId.slice(0, 8)}</span>
                <span className="font-mono font-bold text-brand-yellow">{count}</span>
              </div>
            ))}
          </div>
        )}
      </InfoPanel>

      <InfoPanel title={`💾 Recent Saves (${packs?.length || 0})`}>
        {!packs || packs.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted">ยังไม่มี saved pack</div>
        ) : (
          <div className="divide-y divide-white/[0.07]">
            {packs.map((p: { id: string; output_type: string; title: string | null; user_id: string; created_at: string }) => (
              <div key={p.id} className="flex items-center gap-3 py-2 text-xs">
                <span className="rounded bg-ink-800 px-2 py-0.5 font-mono uppercase">{p.output_type}</span>
                <span className="flex-1 truncate">{p.title || '—'}</span>
                <span className="hidden font-mono text-[10px] text-muted md:inline">
                  {userMap.get(p.user_id)?.split('@')[0] || p.user_id.slice(0, 6)}
                </span>
                <span className="font-mono text-[10px] text-muted">{formatDate(p.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </InfoPanel>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number | string; color: 'red' | 'blue' | 'yellow' | 'pink' }) {
  const colors = {
    red: 'text-brand-red-3',
    blue: 'text-brand-blue-3',
    yellow: 'text-brand-yellow',
    pink: 'text-brand-pink',
  };
  return (
    <div className="rounded-xl border border-white/[0.07] bg-ink-900 p-5">
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted">{label}</div>
      <div className={`mt-1 font-display text-4xl ${colors[color]}`}>{value}</div>
    </div>
  );
}
