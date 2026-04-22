import { NextResponse } from 'next/server';
import { makeMoneyPackFallback, type MoneyPackInput } from '@/lib/engines/make-money';
import { checkUsage, recordUsage } from '@/lib/auth/usage-limiter';

export async function POST(request: Request) {
  try {
    const input: MoneyPackInput = await request.json();

    // ─── Usage gate ───
    const usage = await checkUsage('make_money');
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: 'USAGE_LIMIT_REACHED',
          message: usage.reason,
          plan: usage.plan,
          current: usage.current,
          limit: usage.limit,
          upgrade_url: '/pricing',
        },
        { status: 403 }
      );
    }

    // Validate
    if (!input.goalMode) {
      return NextResponse.json({ error: 'goalMode is required' }, { status: 400 });
    }
    const validModes = ['fast_money', 'trend', 'evergreen', 'seasonal'];
    if (!validModes.includes(input.goalMode)) {
      return NextResponse.json({ error: 'Invalid goalMode' }, { status: 400 });
    }

    // Generate the money pack (fallback for now; swap in AI when keys configured)
    const pack = makeMoneyPackFallback(input);

    // Record usage
    await recordUsage('make_money');

    return NextResponse.json({
      ...pack,
      usage: {
        current: usage.current + 1,
        limit: usage.limit,
        plan: usage.plan,
        remaining: Math.max(0, usage.remaining - 1),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
