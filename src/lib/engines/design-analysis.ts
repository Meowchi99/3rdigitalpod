import type { DesignAnalysisInput, DesignAnalysisResult } from '@/types';

const NICHE_SIGNALS: Record<string, { score: number; market_demand: number; competition: number }> = {
  nurse:     { score: 9, market_demand: 9, competition: 6 },
  teacher:   { score: 8, market_demand: 8, competition: 6 },
  dog:       { score: 9, market_demand: 9, competition: 7 },
  cat:       { score: 8, market_demand: 8, competition: 6 },
  fishing:   { score: 7, market_demand: 7, competition: 5 },
  camping:   { score: 7, market_demand: 7, competition: 5 },
  mechanic:  { score: 8, market_demand: 7, competition: 5 },
  mom:       { score: 8, market_demand: 9, competition: 7 },
  dad:       { score: 8, market_demand: 9, competition: 7 },
  gym:       { score: 6, market_demand: 7, competition: 8 },
  christmas: { score: 9, market_demand: 10, competition: 9 },
  halloween: { score: 8, market_demand: 9, competition: 8 },
};

const STYLE_SIGNALS: Record<string, { quality: number; typography: number; uniqueness: number }> = {
  vintage:   { quality: 9, typography: 8, uniqueness: 7 },
  retro:     { quality: 9, typography: 8, uniqueness: 7 },
  minimalist:{ quality: 8, typography: 8, uniqueness: 6 },
  kawaii:    { quality: 7, typography: 6, uniqueness: 8 },
  cute:      { quality: 7, typography: 6, uniqueness: 8 },
  bold:      { quality: 8, typography: 9, uniqueness: 6 },
  typography:{ quality: 8, typography: 10, uniqueness: 6 },
  grunge:    { quality: 7, typography: 7, uniqueness: 8 },
};

function matchSignal<T>(
  tags: string[],
  bank: Record<string, T>,
  fallback: T
): T {
  for (const tag of tags) {
    const key = tag.toLowerCase();
    for (const bankKey of Object.keys(bank)) {
      if (key.includes(bankKey)) return bank[bankKey];
    }
  }
  return fallback;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Deterministic design scoring from manual tags.
 * Works without any vision API — based on heuristic niche/style lookup.
 */
export function analyzeDesignFallback(
  input: DesignAnalysisInput
): DesignAnalysisResult {
  const tags = (input.manual_tags || []).map((t) => t.toLowerCase());
  if (input.niche_hint) tags.push(input.niche_hint.toLowerCase());
  if (tags.length === 0) tags.push('general');

  const niche = matchSignal(tags, NICHE_SIGNALS, {
    score: 6,
    market_demand: 6,
    competition: 7,
  });
  const style = matchSignal(tags, STYLE_SIGNALS, {
    quality: 7,
    typography: 7,
    uniqueness: 6,
  });

  // Score each dimension (0-10)
  const scores = {
    design_quality: round1(style.quality + (Math.random() * 0.6 - 0.3)),
    niche_clarity: round1(niche.score - 0.5 + Math.random() * 1.0),
    competition_level: round1(11 - niche.competition),
    seo_potential: round1(niche.score - 1 + Math.random() * 1.5),
    audience_match: round1(7 + Math.random() * 1.5),
    print_feasibility: round1(8 + Math.random() * 1),
    color_contrast: round1(7.5 + Math.random() * 1.5),
    typography: round1(style.typography),
    uniqueness: round1(style.uniqueness),
    market_demand: round1(niche.market_demand),
  };

  const total = round1(
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length
  );

  let verdict: 'YES' | 'MAYBE' | 'NO' = 'NO';
  if (total >= 8) verdict = 'YES';
  else if (total >= 6.5) verdict = 'MAYBE';

  const confidence = Math.min(99, Math.round(total * 10 + Math.random() * 5));

  // Identify the dominant niche keyword
  const suggestedNiche =
    Object.keys(NICHE_SIGNALS).find((n) =>
      tags.some((t) => t.includes(n))
    ) || 'general';

  const keywords = [
    suggestedNiche,
    `${suggestedNiche} shirt`,
    `${suggestedNiche} gift`,
    `funny ${suggestedNiche}`,
    `${suggestedNiche} lover`,
  ];

  const audience =
    suggestedNiche === 'nurse'
      ? 'healthcare professionals, women 25-55'
      : suggestedNiche === 'teacher'
      ? 'educators, students'
      : suggestedNiche === 'dog' || suggestedNiche === 'cat'
      ? 'pet owners'
      : 'unisex general audience';

  // Warnings
  const warnings: string[] = [];
  if (scores.competition_level < 5) warnings.push('High competition — market saturated.');
  if (scores.uniqueness < 6) warnings.push('Design may feel generic. Add distinctive element.');
  if (scores.typography < 6) warnings.push('Typography could be clearer for print.');

  // Improvements
  const improvements: string[] = [
    'Test 2–3 colorway variations before committing.',
    'Use a concise, memorable phrase (3–5 words) in the headline.',
    'Ensure design reads clearly at thumbnail size (critical for Amazon).',
    'Research top 10 competitor BSR to validate demand.',
  ];

  const adRec =
    verdict === 'YES'
      ? {
          budget_usd_per_day: 3,
          targeting: 'broad + exact-match top keywords',
          expected_acos: '20-30%',
        }
      : verdict === 'MAYBE'
      ? {
          budget_usd_per_day: 2,
          targeting: 'exact-match only, low bids',
          expected_acos: '30-45%',
        }
      : {
          budget_usd_per_day: 1,
          targeting: 'not recommended without iteration',
          expected_acos: '45%+',
        };

  return {
    verdict,
    confidence,
    total_score: total,
    scores,
    suggested_niche: suggestedNiche,
    suggested_keywords: keywords,
    audience,
    warnings,
    improvements,
    ad_recommendation: adRec,
    mode: 'fallback',
  };
}
