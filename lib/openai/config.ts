import 'server-only';
export const AI_CONFIG = { model: process.env.OPENAI_MODEL || 'gpt-5.4-mini', timeoutMs: 90_000, maxOutputTokens: 7500, reasoning: 'low' as const };
