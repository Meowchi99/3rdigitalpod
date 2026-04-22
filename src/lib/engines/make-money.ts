import { generatePromptFallback } from './prompt-engine';
import { generateListingFallback } from './listing-engine';
import type { PromptEngineOutput, ListingEngineOutput } from '@/types';

export type GoalMode = 'fast_money' | 'trend' | 'evergreen' | 'seasonal';

export interface MoneyPackInput {
  seedKeyword?: string;
  goalMode: GoalMode;
  audience?: string;
  style?: string;
}

export interface MoneyPack {
  selectedSeed: string;
  selectedNiche: string;
  score: number;
  demand: number;
  competition: number;
  season_boost: number;
  prompt: PromptEngineOutput;
  listing: ListingEngineOutput;
  why: string[];
  mode: 'api' | 'fallback';
  goal_mode: GoalMode;
  generated_at: string;
}

// ─── SEED POOLS by goal mode ───
// Scores are based on real POD trends: higher demand = more searches, higher competition = harder to rank

const TREND_POOL = [
  { seed: 'earth day 2026',   demand: 9, competition: 6, season: 1 },
  { seed: 'mothers day',      demand: 10, competition: 7, season: 2 },
  { seed: 'nurse week',       demand: 9, competition: 5, season: 2 },
  { seed: 'graduation 2026',  demand: 9, competition: 6, season: 2 },
  { seed: 'teacher appreciation', demand: 8, competition: 5, season: 2 },
  { seed: 'spring vibes',     demand: 8, competition: 6, season: 1 },
  { seed: 'bbq season',       demand: 7, competition: 5, season: 1 },
];

const EVERGREEN_POOL = [
  { seed: 'dog mom',          demand: 10, competition: 8, season: 0 },
  { seed: 'dog dad',          demand: 9, competition: 7, season: 0 },
  { seed: 'cat mom',          demand: 8, competition: 7, season: 0 },
  { seed: 'nurse life',       demand: 9, competition: 6, season: 0 },
  { seed: 'teacher life',     demand: 8, competition: 6, season: 0 },
  { seed: 'mechanic dad',     demand: 7, competition: 4, season: 0 },
  { seed: 'fishing vibes',    demand: 7, competition: 5, season: 0 },
  { seed: 'camp life',        demand: 7, competition: 5, season: 0 },
  { seed: 'plant mom',        demand: 7, competition: 6, season: 0 },
  { seed: 'gamer life',       demand: 7, competition: 7, season: 0 },
];

const SEASONAL_POOL = [
  { seed: 'christmas 2026',   demand: 10, competition: 9, season: 3 },
  { seed: 'halloween vibes',  demand: 9, competition: 8, season: 3 },
  { seed: 'valentine gift',   demand: 8, competition: 7, season: 3 },
  { seed: 'thanksgiving',     demand: 7, competition: 6, season: 2 },
  { seed: 'fourth of july',   demand: 8, competition: 7, season: 2 },
  { seed: 'st patricks day',  demand: 7, competition: 6, season: 2 },
];

const FAST_MONEY_POOL = [
  // Low competition + medium-high demand = fast wins
  { seed: 'mechanic wife',    demand: 6, competition: 3, season: 0 },
  { seed: 'fishing grandpa',  demand: 6, competition: 3, season: 0 },
  { seed: 'homeschool mom',   demand: 7, competition: 4, season: 0 },
  { seed: 'dental assistant', demand: 6, competition: 3, season: 0 },
  { seed: 'crna life',        demand: 7, competition: 3, season: 0 },
  { seed: 'mail carrier',     demand: 6, competition: 3, season: 0 },
  { seed: 'welder life',      demand: 6, competition: 4, season: 0 },
  { seed: 'truck driver wife', demand: 7, competition: 4, season: 0 },
  { seed: 'pickleball mom',   demand: 8, competition: 5, season: 1 },
];

// ─── NICHE MODIFIERS to expand a seed into candidates ───
const NICHE_MODIFIERS = [
  { suffix: 'vintage tee', boost: 1.0 },
  { suffix: 'retro shirt', boost: 1.0 },
  { suffix: 'typography design', boost: 0.5 },
  { suffix: 'funny gift', boost: 0.8 },
  { suffix: 'lover club', boost: 0.6 },
  { suffix: 'squad',       boost: 0.7 },
  { suffix: 'appreciation', boost: 0.9 },
];

function pickPool(mode: GoalMode) {
  switch (mode) {
    case 'trend':     return TREND_POOL;
    case 'evergreen': return EVERGREEN_POOL;
    case 'seasonal':  return SEASONAL_POOL;
    case 'fast_money':
    default:          return FAST_MONEY_POOL;
  }
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function scoreNiche(demand: number, competition: number, seasonBoost: number, modBoost: number): number {
  // score = demand - competition + seasonBoost + (modifierBoost * 1.5)
  // Clamp to 0-20 range, then scale to /10 for display
  const raw = demand - competition + seasonBoost + modBoost * 1.5;
  return Math.max(0, Math.round(raw * 10) / 10);
}

function buildWhy(
  demand: number,
  competition: number,
  seasonBoost: number,
  goalMode: GoalMode
): string[] {
  const why: string[] = [];

  if (demand >= 8) {
    why.push(`🔥 High demand: ${demand}/10 — ผู้ซื้อค้นหา niche นี้เยอะทุกวัน`);
  } else if (demand >= 6) {
    why.push(`⚡ Demand ${demand}/10 — มีฐานลูกค้าที่มั่นคง ไม่ใหญ่แต่ซื้อจริง`);
  }

  if (competition <= 4) {
    why.push(`🎯 Low competition: ${competition}/10 — ช่องว่างในตลาดยังเยอะ ขึ้นอันดับได้ไว`);
  } else if (competition <= 6) {
    why.push(`⚖️ Competition ${competition}/10 — สู้ได้ถ้าดีไซน์โดดเด่น`);
  } else {
    why.push(`⚠️ Competition ${competition}/10 สูง — ต้องดีไซน์ unique + SEO แน่น`);
  }

  if (seasonBoost >= 2) {
    why.push(`🗓 Season boost +${seasonBoost} — กำลังเข้าสู่ peak season ควรลงตอนนี้`);
  } else if (goalMode === 'evergreen') {
    why.push(`♾ Evergreen — ขายได้ทั้งปี ไม่ต้องพึ่ง season`);
  } else if (goalMode === 'fast_money') {
    why.push(`💸 Fast money pick — demand/competition ratio ดี ลงได้ทันที`);
  }

  return why.slice(0, 3);
}

/**
 * Core Make-Money generator.
 * Deterministic enough to be useful, random enough to feel fresh each press.
 */
export function makeMoneyPackFallback(input: MoneyPackInput): MoneyPack {
  const pool = pickPool(input.goalMode);

  // Step 1: pick seed
  let seedEntry: { seed: string; demand: number; competition: number; season: number };
  if (input.seedKeyword && input.seedKeyword.trim()) {
    const seed = input.seedKeyword.trim().toLowerCase();
    // Custom seed — infer defaults
    seedEntry = {
      seed,
      demand: 7,
      competition: 5,
      season: input.goalMode === 'seasonal' ? 2 : input.goalMode === 'trend' ? 1 : 0,
    };
  } else {
    seedEntry = randomFrom(pool);
  }

  // Step 2: expand into candidates by picking 3 modifiers
  const candidates = [];
  const shuffled = [...NICHE_MODIFIERS].sort(() => Math.random() - 0.5);
  for (let i = 0; i < 3; i++) {
    const mod = shuffled[i];
    const niche = `${seedEntry.seed} ${mod.suffix}`.trim();
    const score = scoreNiche(seedEntry.demand, seedEntry.competition, seedEntry.season, mod.boost);
    candidates.push({
      niche,
      score,
      modBoost: mod.boost,
    });
  }

  // Step 4: pick highest score
  candidates.sort((a, b) => b.score - a.score);
  const winner = candidates[0];

  // Step 5: prompt
  const prompt = generatePromptFallback({
    keyword: winner.niche,
    style: input.style || 'Vintage Retro',
    audience: input.audience || 'unisex',
    season: input.goalMode === 'seasonal' ? 'q4 / christmas' : 'evergreen',
    depth: 'detailed',
  });

  // Step 6: listing
  const listing = generateListingFallback({
    niche: winner.niche,
    product_type: 'T-Shirt',
    audience: input.audience || 'unisex',
    occasion: input.goalMode === 'seasonal' ? 'christmas' : 'everyday',
  });

  // Step 7: why
  const why = buildWhy(
    seedEntry.demand,
    seedEntry.competition,
    seedEntry.season,
    input.goalMode
  );

  return {
    selectedSeed: seedEntry.seed,
    selectedNiche: winner.niche,
    score: winner.score,
    demand: seedEntry.demand,
    competition: seedEntry.competition,
    season_boost: seedEntry.season,
    prompt,
    listing,
    why,
    mode: 'fallback',
    goal_mode: input.goalMode,
    generated_at: new Date().toISOString(),
  };
}
