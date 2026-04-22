import { NextResponse } from 'next/server';
import { analyzeDesignFallback } from '@/lib/engines/design-analysis';
import { callVision } from '@/lib/ai/router';
import { createClient } from '@/lib/supabase/server';
import type { DesignAnalysisInput, DesignAnalysisResult } from '@/types';

export async function POST(request: Request) {
  try {
    const input: DesignAnalysisInput = await request.json();
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let result: DesignAnalysisResult;

    // Try vision API if image provided
    if (input.image_base64) {
      const system =
        'You are a Print-on-Demand design reviewer. Score the design across 10 dimensions (0-10 each) ' +
        'and return strict JSON matching DesignAnalysisResult schema with: verdict (YES/MAYBE/NO), ' +
        'confidence (0-100), total_score, scores object, suggested_niche, suggested_keywords, audience, warnings, improvements.';
      const user_prompt =
        `Please analyze this POD design image. Manual tags: ${(input.manual_tags || []).join(', ') || 'none'}. ` +
        `Niche hint: ${input.niche_hint || 'none'}. Respond with JSON only.`;

      const aiText = await callVision(system, user_prompt, input.image_base64);
      if (aiText) {
        try {
          const cleaned = aiText.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          result = { ...parsed, mode: 'api' };
        } catch {
          result = analyzeDesignFallback(input);
        }
      } else {
        result = analyzeDesignFallback(input);
      }
    } else {
      result = analyzeDesignFallback(input);
    }

    // Log the analysis if user is authenticated
    if (user) {
      await supabase.from('design_analysis_logs').insert({
        user_id: user.id,
        image_url: input.image_url ?? null,
        manual_tags: input.manual_tags ?? null,
        mode_used: result.mode,
        result_json: result,
      });
      await supabase.rpc('increment_usage', { p_action: 'design_analysis' });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
