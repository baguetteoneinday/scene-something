import { z } from 'zod';
import { structured } from '@/lib/openai/parse';
import { analysisSchema,questionsSchema } from '@/lib/openai/schemas';
import { QUESTIONS_SYSTEM_PROMPT } from '@/lib/openai/prompts';
import { apiError,success } from '@/lib/openai/errors';
import { checkOrigin,readJson } from '@/lib/openai/request';
import { memoryQuestions,questionLimit } from '@/lib/story/questions';
export const runtime='nodejs';
export async function POST(request:Request){try{checkOrigin(request);const data=analysisSchema.parse(await readJson(request));const limit=questionLimit(data);const result=await structured('missing_context',questionsSchema.extend({questions:z.array(questionsSchema.shape.questions.element.extend({kind:z.enum(['context','emotion'])})).max(limit-1)}),QUESTIONS_SYSTEM_PROMPT+` Ask up to ${limit-1} contextual questions for these ${data.photoAnalysis.length} photos. At least half of your questions should have kind emotion. Ask about the feeling then, what remains now, an unexpected or mixed feeling, or why the moment matters. Do not assume happiness, gratitude, sadness or a specific relationship. Each question should ask one thing. The server already asks a core-memory question per chapter: do not duplicate it. Ask factual questions only for context important to understanding the experience. Do not fill the limit with redundant or visually answerable questions.`,[{role:'user',content:JSON.stringify(data)}]);return success({questions:memoryQuestions(data,result.questions)});}catch(error){return apiError(error);}}
