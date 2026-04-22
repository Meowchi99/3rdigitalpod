import { createClient } from '@/lib/supabase/server';
import type { UserPlan } from '@/types';

export const PLAN_LIMITS: Record<UserPlan, Record<string, number>> = {
  free: {
    make_money: 3,
    design_analysis: 5,
    batch: 0, // pro-only
  },
  pro: {
    make_money: 1000,
    design_analysis: 200,
    batch: 50,
  },
  elite: {
    make_money: 999999,
    design_analysis: 999999,
    batch: 999999,
  },
};

export interface UsageCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  plan: UserPlan;
  userId: string | null;
  remaining: number;
  reason?: string;
}

/**
 * Check whether the current user can perform an action today.
 * If not authenticated, returns allowed=true with userId=null (public/guest mode).
 * Guest usage is tracked via client-side localStorage (not server-side).
 */
export async function checkUsage(
  action: string
): Promise<UsageCheckResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      allowed: true,
      current: 0,
      limit: PLAN_LIMITS.free[action] ?? 1,
      plan: 'free',
      userId: null,
      remaining: PLAN_LIMITS.free[action] ?? 1,
    };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  const plan: UserPlan = (profile?.plan as UserPlan) || 'free';
  const limit = PLAN_LIMITS[plan][action] ?? 1;

  const today = new Date().toISOString().split('T')[0];
  const { data: usage } = await supabase
    .from('usage_logs')
    .select('usage_count')
    .eq('user_id', user.id)
    .eq('action_name', action)
    .eq('usage_date', today)
    .maybeSingle();

  const current = usage?.usage_count ?? 0;
  const remaining = Math.max(0, limit - current);
  const allowed = current < limit;

  return {
    allowed,
    current,
    limit,
    plan,
    userId: user.id,
    remaining,
    reason: !allowed
      ? `Daily limit reached (${current}/${limit}) for plan "${plan}"`
      : undefined,
  };
}

/**
 * Increment usage for an action (call only after successful action).
 * No-op if user is not logged in.
 */
export async function recordUsage(action: string, count = 1): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.rpc('increment_usage', {
    p_action: action,
    p_count: count,
  });
}
