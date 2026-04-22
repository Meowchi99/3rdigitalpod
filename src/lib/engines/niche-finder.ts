import type { AnalysisMode } from '@/types';

export interface NicheResult {
  name: string;
  heat: 'high' | 'medium' | 'rising' | 'low';
  competition: 'very low' | 'low' | 'medium' | 'high';
  audience: string;
  score: number;
}

export interface NicheFinderInput {
  seed: string;
  audience?: string;
  season?: string;
  competition_target?: 'low' | 'medium' | 'any';
}

const MODIFIERS = [
  { suffix: 'mom vintage shirt', heat: 'high', comp: 'medium' },
  { suffix: 'dad retro tee', heat: 'high', comp: 'low' },
  { suffix: 'lover gifts', heat: 'medium', comp: 'low' },
  { suffix: 'life typography', heat: 'medium', comp: 'medium' },
  { suffix: 'owner squad', heat: 'rising', comp: 'very low' },
  { suffix: 'club vintage', heat: 'rising', comp: 'very low' },
  { suffix: 'appreciation gift', heat: 'high', comp: 'medium' },
] as const;

export function findNichesFallback(
  input: NicheFinderInput
): { niches: NicheResult[]; mode: AnalysisMode } {
  const seed = (input.seed || 'custom').trim().toLowerCase();
  const audience = input.audience || 'unisex';
  const target = input.competition_target || 'any';

  const base = MODIFIERS.map((m) => ({
    name: `${seed} ${m.suffix}`,
    heat: m.heat as NicheResult['heat'],
    competition: m.comp as NicheResult['competition'],
    audience,
    score:
      (m.heat === 'high' ? 9 : m.heat === 'medium' ? 7 : m.heat === 'rising' ? 6.5 : 5) +
      (m.comp === 'very low' ? 1 : m.comp === 'low' ? 0.5 : 0),
  }));

  // Filter by competition if requested
  const filtered =
    target === 'any'
      ? base
      : target === 'low'
      ? base.filter((n) => n.competition === 'very low' || n.competition === 'low')
      : base.filter((n) => n.competition !== 'high');

  return {
    niches: filtered.slice(0, 5).sort((a, b) => b.score - a.score),
    mode: 'fallback',
  };
}
