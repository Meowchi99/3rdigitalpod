import type { ListingEngineInput, ListingEngineOutput } from '@/types';

const LIMITS = {
  brand: 50,
  title: 60,
  bullet: 250,
  description: 2000,
};

const POWER_WORDS = [
  'premium', 'soft', 'comfortable', 'unique', 'perfect', 'exclusive',
  'high-quality', 'durable', 'stylish', 'fun',
];

const OCCASION_PHRASES: Record<string, string> = {
  everyday: 'great for everyday wear',
  birthday: 'a perfect birthday gift',
  christmas: 'an ideal Christmas present',
  halloween: 'a spooky Halloween favorite',
  "mother's day": "a heartfelt Mother's Day gift",
  "father's day": "a classic Father's Day gift",
  valentine: 'a sweet Valentine\'s Day gift',
  thanksgiving: 'a Thanksgiving family favorite',
};

function trimTo(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.7 ? cut.slice(0, lastSpace) : cut).trim();
}

function capWords(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function generateListingFallback(
  input: ListingEngineInput
): ListingEngineOutput {
  const niche = (input.niche || 'Custom Niche').trim();
  const productType = input.product_type || 'T-Shirt';
  const audience = (input.audience || '').trim();
  const occasion = (input.occasion || 'everyday').toLowerCase();

  const nicheCap = capWords(niche);
  const firstWord = nicheCap.split(' ')[0];

  // ─── Brand (≤50) ───
  const brand = trimTo(`${firstWord} Apparel Co`, LIMITS.brand);

  // ─── Title (≤60) ───
  const titleBase = audience
    ? `${nicheCap} ${productType} for ${capWords(audience)}`
    : `Funny ${nicheCap} ${productType}`;
  const title = trimTo(titleBase, LIMITS.title);

  // ─── Bullet 1 (≤250) ───
  const bullet1 = trimTo(
    `PREMIUM ${nicheCap.toUpperCase()} DESIGN — This ${productType.toLowerCase()} features a ${POWER_WORDS[0]}, unique graphic perfect for anyone who loves ${niche.toLowerCase()}. Made with soft, comfortable fabric that holds up wash after wash.`,
    LIMITS.bullet
  );

  // ─── Bullet 2 (≤250) ───
  const occasionPhrase =
    Object.entries(OCCASION_PHRASES).find(([k]) => occasion.includes(k))?.[1] ||
    OCCASION_PHRASES.everyday;
  const bullet2 = trimTo(
    `PERFECT GIFT — Whether ${occasionPhrase}, this ${nicheCap} ${productType.toLowerCase()} is sure to stand out. Great for${audience ? ` ${audience},` : ''} birthdays, holidays, and everyday self-expression.`,
    LIMITS.bullet
  );

  // ─── Description (≤2000) ───
  const description = trimTo(
    [
      `Show your love for ${niche.toLowerCase()} with this exclusive ${nicheCap} ${productType.toLowerCase()}.`,
      `Featuring a one-of-a-kind design crafted for${audience ? ` ${audience} and ` : ' '}fans of ${niche.toLowerCase()}.`,
      `Printed on soft, high-quality fabric that stays vibrant wash after wash.`,
      `Ideal for ${occasionPhrase}, casual days out, and making a statement.`,
      `Available in multiple sizes and colors. Order yours today and make every day ${nicheCap.toLowerCase()} day!`,
    ].join(' '),
    LIMITS.description
  );

  // ─── SEO keywords ───
  const seoKeywords = [
    niche.toLowerCase(),
    `${niche.toLowerCase()} ${productType.toLowerCase()}`,
    `${niche.toLowerCase()} gift`,
    `funny ${niche.toLowerCase()}`,
    `${niche.toLowerCase()} lover`,
    audience ? `${audience} ${niche.toLowerCase()}` : '',
    occasion !== 'everyday' ? `${niche.toLowerCase()} ${occasion} gift` : '',
  ]
    .filter(Boolean)
    .slice(0, 7);

  return {
    brand,
    title,
    bullet_1: bullet1,
    bullet_2: bullet2,
    description,
    seo_keywords: seoKeywords,
    mode: 'fallback',
  };
}
