import { structured } from '@/lib/openai/parse';
import { analysisSchema,questionsSchema } from '@/lib/openai/schemas';
import { QUESTIONS_SYSTEM_PROMPT } from '@/lib/openai/prompts';
import { apiError,success } from '@/lib/openai/errors';
import { checkOrigin,readJson } from '@/lib/openai/request';
import { finalizeQuestions,questionLimit } from '@/lib/story/questions';
export const runtime='nodejs';
export async function POST(request:Request){try{checkOrigin(request);const data=analysisSchema.parse(await readJson(request));const limit=questionLimit(data);const result=await structured('missing_context',questionsSchema.extend({questions:questionsSchema.shape.questions.max(limit-1)}),QUESTIONS_SYSTEM_PROMPT+` Ask up to ${limit-1} contextual questions for these ${data.photoAnalysis.length} photos. Cover distinct dates/scenes with missing experience, meaning or feelings before asking more about one scene. Do not fill the limit with redundant or visually answerable questions.`,[{role:'user',content:JSON.stringify(data)}]);return success({questions:finalizeQuestions(result.questions,data.photoAnalysis.map(p=>p.id),limit)});}catch(error){return apiError(error);}}
