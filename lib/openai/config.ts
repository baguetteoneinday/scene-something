import 'server-only';
export const AI_CONFIG = { model: process.env.OPENAI_MODEL || 'gpt-5.4-mini', timeoutMs: 180_000, maxOutputTokens: 24000, reasoning: 'low' as const };
