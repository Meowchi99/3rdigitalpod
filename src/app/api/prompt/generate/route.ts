import { NextResponse } from 'next/server';
import { generatePromptFallback } from '@/lib/engines/prompt-engine';
import { callAI } from '@/lib/ai/router';
import type { PromptEngineInput, PromptEngineOutput } from '@/types';

export async function POST(request: Request) {
  try {
    const input: PromptEngineInput = await request.json();

    // Try AI first (if available)
    const system =
      'You are a prompt engineer for Print-on-Demand t-shirt designs. ' +
      'Given structured inputs, produce a single Midjourney/DALL-E style prompt ' +
      '(no explanations, just the prompt text).';
    const user = `Keyword: ${input.keyword}
Style: ${input.style || 'Bold'}
Audience: ${input.audience || 'unisex'}
Season: ${input.season || 'evergreen'}
Depth: ${input.depth || 'detailed'}`;

    const aiResult = await callAI(system, user, { temperature: 0.75, maxTokens: 300 });

    if (aiResult && aiResult.length > 20) {
      const out: PromptEngineOutput = {
        prompt: aiResult.trim(),
        tags: [input.keyword.toLowerCase().replace(/\s+/g, '-'), input.style || ''].filter(Boolean),
        suggested_styles: [],
        mode: 'api',
      };
      return NextResponse.json(out);
    }

    // Fallback path
    return NextResponse.json(generatePromptFallback(input));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
