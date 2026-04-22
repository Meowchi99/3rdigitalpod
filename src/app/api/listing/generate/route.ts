import { NextResponse } from 'next/server';
import { generateListingFallback } from '@/lib/engines/listing-engine';
import { callAI } from '@/lib/ai/router';
import type { ListingEngineInput, ListingEngineOutput } from '@/types';

export async function POST(request: Request) {
  try {
    const input: ListingEngineInput = await request.json();

    const system =
      'You generate Amazon Merch listings. Output strict JSON matching: ' +
      '{"brand":"≤50 chars","title":"≤60 chars","bullet_1":"≤250","bullet_2":"≤250","description":"≤2000","seo_keywords":["..."]}';
    const user = `Niche: ${input.niche}
Product: ${input.product_type}
Audience: ${input.audience || ''}
Occasion: ${input.occasion || 'everyday'}`;

    const aiResult = await callAI(system, user, { temperature: 0.7, maxTokens: 800 });

    if (aiResult) {
      try {
        // Try parsing JSON from AI response (strip code fences if present)
        const cleaned = aiResult.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        const out: ListingEngineOutput = {
          brand: String(parsed.brand || '').slice(0, 50),
          title: String(parsed.title || '').slice(0, 60),
          bullet_1: String(parsed.bullet_1 || '').slice(0, 250),
          bullet_2: String(parsed.bullet_2 || '').slice(0, 250),
          description: String(parsed.description || '').slice(0, 2000),
          seo_keywords: Array.isArray(parsed.seo_keywords)
            ? parsed.seo_keywords.slice(0, 10)
            : [],
          mode: 'api',
        };
        return NextResponse.json(out);
      } catch {
        // JSON parse failed — fall through to fallback
      }
    }

    return NextResponse.json(generateListingFallback(input));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
