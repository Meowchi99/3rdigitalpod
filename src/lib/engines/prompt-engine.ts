import type { PromptEngineInput, PromptEngineOutput } from '@/types';

const STYLE_MODIFIERS: Record<string, string[]> = {
  'Vintage Retro': ['distressed texture', 'aged look', '70s palette', 'sun-bleached'],
  'Cute Kawaii': ['pastel colors', 'chibi style', 'soft shapes', 'friendly expressions'],
  'Bold Typography': ['thick sans-serif', 'high contrast', 'text-forward composition'],
  'Minimalist': ['clean lines', 'limited palette', 'negative space', 'geometric'],
  'Hand-drawn': ['sketchy lines', 'watercolor wash', 'imperfect charm'],
  'Grunge Distressed': ['rough texture', 'grainy overlay', 'ink splatter'],
};

const AUDIENCE_HINTS: Record<string, string> = {
  women: 'feminine palette, elegant composition',
  men: 'bold masculine palette, strong graphic',
  unisex: 'universal appeal, balanced colors',
  kids: 'playful illustration, rounded shapes',
  seniors: 'readable typography, classic palette',
};

const SEASON_HINTS: Record<string, string> = {
  evergreen: 'year-round appeal, neutral color palette',
  'q4 / christmas': 'red and green accents, winter motif',
  'mother\'s day': 'warm pastels, floral elements, spring feel',
  summer: 'bright saturated palette, beach / outdoor motif',
  halloween: 'orange and black palette, spooky elements',
  valentine: 'red and pink palette, heart motifs',
};

const DEPTH_PREFIX: Record<string, string> = {
  simple: 'A clean',
  detailed: 'A highly detailed, print-ready',
  pro: 'A professionally designed, commercial-grade, print-on-demand',
};

function normalize(s: string): string {
  return (s || '').trim().toLowerCase();
}

function pickStyleMods(style: string): string[] {
  const key = Object.keys(STYLE_MODIFIERS).find(
    (k) => k.toLowerCase() === (style || '').toLowerCase()
  );
  return key ? STYLE_MODIFIERS[key] : ['bold graphic design'];
}

/**
 * Deterministic, API-free prompt generator.
 * Produces coherent Midjourney/DALL-E style prompts from structured inputs.
 */
export function generatePromptFallback(
  input: PromptEngineInput
): PromptEngineOutput {
  const kw = (input.keyword || 'custom niche').trim();
  const style = input.style || 'Bold Typography';
  const audience = normalize(input.audience || 'unisex');
  const season = normalize(input.season || 'evergreen');
  const depth = input.depth || 'detailed';
  const tool = input.tool || 'midjourney';

  const styleMods = pickStyleMods(style);
  const audHint = AUDIENCE_HINTS[audience] || AUDIENCE_HINTS.unisex;
  const seasonHint =
    Object.entries(SEASON_HINTS).find(([k]) => season.includes(k))?.[1] ||
    SEASON_HINTS.evergreen;

  const prefix = DEPTH_PREFIX[depth];
  const parts: string[] = [
    `${prefix} t-shirt design about "${kw}"`,
    `${style.toLowerCase()} style`,
    styleMods.slice(0, 2).join(', '),
    audHint,
    seasonHint,
    'transparent background',
    'suitable for print-on-demand, high resolution, vector art style',
  ];

  if (tool === 'midjourney') {
    parts.push('--ar 1:1 --style raw --v 6');
  }

  const prompt = parts.filter(Boolean).join(', ');

  const tags = [
    kw.toLowerCase().replace(/\s+/g, '-'),
    normalize(style).replace(/\s+/g, '-'),
    audience,
    season.split(/\s+/)[0],
  ].filter(Boolean);

  return {
    prompt,
    negative_prompt: 'no watermarks, no text artifacts, no low quality, no extra limbs',
    tags,
    suggested_styles: Object.keys(STYLE_MODIFIERS).filter(
      (s) => s.toLowerCase() !== style.toLowerCase()
    ).slice(0, 3),
    mode: 'fallback',
  };
}

/**
 * Expand a niche into N prompt variations (fallback mode).
 */
export function expandPromptFallback(
  niche: string,
  count: number,
  styleMix: 'mixed' | 'same',
  fixedStyle?: string
): PromptEngineOutput[] {
  const styles = Object.keys(STYLE_MODIFIERS);
  const results: PromptEngineOutput[] = [];
  for (let i = 0; i < Math.max(1, Math.min(10, count)); i++) {
    const style =
      styleMix === 'same' && fixedStyle ? fixedStyle : styles[i % styles.length];
    results.push(
      generatePromptFallback({
        keyword: niche,
        style,
        depth: 'detailed',
      })
    );
  }
  return results;
}
