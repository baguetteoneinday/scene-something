import { structured } from '@/lib/openai/parse';
import { analysisSchema,questionsSchema } from '@/lib/openai/schemas';
import { QUESTIONS_SYSTEM_PROMPT } from '@/lib/openai/prompts';
import { apiError,success } from '@/lib/openai/errors';
import { checkOrigin,readJson } from '@/lib/openai/request';
export const runtime='nodejs';
export async function POST(request:Request){try{checkOrigin(request);const data=analysisSchema.parse(await readJson(request));return success(await structured('missing_context',questionsSchema,QUESTIONS_SYSTEM_PROMPT,[{role:'user',content:JSON.stringify(data)}]));}catch(error){return apiError(error);}}
