import { structured } from '@/lib/openai/parse';
import { analysisSchema,questionsSchema } from '@/lib/openai/schemas';
import { QUESTIONS_SYSTEM_PROMPT } from '@/lib/openai/prompts';
import { apiError,success } from '@/lib/openai/errors';
import { checkOrigin,readJson } from '@/lib/openai/request';
import { finalizeQuestions } from '@/lib/story/questions';
export const runtime='nodejs';
export async function POST(request:Request){try{checkOrigin(request);const data=analysisSchema.parse(await readJson(request));const result=await structured('missing_context',questionsSchema.extend({questions:questionsSchema.shape.questions.max(4)}),QUESTIONS_SYSTEM_PROMPT,[{role:'user',content:JSON.stringify(data)}]);return success({questions:finalizeQuestions(result.questions,data.photoAnalysis.map(p=>p.id))});}catch(error){return apiError(error);}}
