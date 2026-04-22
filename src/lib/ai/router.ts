/**
 * AI Router — unifies OpenAI and Gemini under one interface.
 * If no key is present, caller uses fallback engines.
 */

export interface AIProviderStatus {
  openai: boolean;
  gemini: boolean;
  preferred: 'openai' | 'gemini' | 'none';
}

export function getProviderStatus(): AIProviderStatus {
  const openai = !!process.env.OPENAI_API_KEY;
  const gemini = !!process.env.GEMINI_API_KEY;
  return {
    openai,
    gemini,
    preferred: openai ? 'openai' : gemini ? 'gemini' : 'none',
  };
}

/**
 * Low-level chat-completion call. Returns text, or null if no provider available.
 * Callers should handle null by falling back to the fallback engine.
 */
export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string | null> {
  const status = getProviderStatus();
  if (status.preferred === 'none') return null;

  const temperature = options?.temperature ?? 0.7;
  const maxTokens = options?.maxTokens ?? 800;

  try {
    if (status.preferred === 'openai') {
      return await callOpenAI(systemPrompt, userPrompt, temperature, maxTokens);
    } else {
      return await callGemini(systemPrompt, userPrompt, temperature, maxTokens);
    }
  } catch (err) {
    console.error('[AI Router] provider failed:', err);
    return null;
  }
}

async function callOpenAI(
  system: string,
  user: string,
  temperature: number,
  maxTokens: number
): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

async function callGemini(
  system: string,
  user: string,
  temperature: number,
  maxTokens: number
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { temperature, maxOutputTokens: maxTokens },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

/**
 * Vision call (image analysis). Only OpenAI vision implemented here.
 * Returns null if unavailable — caller falls back.
 */
export async function callVision(
  systemPrompt: string,
  userPrompt: string,
  imageBase64: string
): Promise<string | null> {
  const status = getProviderStatus();
  if (!status.openai) return null; // Gemini vision requires slightly different payload; left as TODO

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              },
            ],
          },
        ],
        max_tokens: 1200,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI Vision ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  } catch (err) {
    console.error('[Vision] failed:', err);
    return null;
  }
}
