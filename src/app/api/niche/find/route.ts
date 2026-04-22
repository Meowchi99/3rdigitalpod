import { NextResponse } from 'next/server';
import { findNichesFallback, type NicheFinderInput } from '@/lib/engines/niche-finder';

export async function POST(request: Request) {
  try {
    const input: NicheFinderInput = await request.json();
    // For now, fallback only. Swap in callAI when you want AI-powered niche discovery.
    return NextResponse.json(findNichesFallback(input));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
