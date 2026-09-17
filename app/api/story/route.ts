import { structured } from '@/lib/openai/parse';
import { storyRequestSchema,storySchema } from '@/lib/openai/schemas';
import { MEMORY_STORY_SYSTEM_PROMPT,FICTION_STORY_SYSTEM_PROMPT } from '@/lib/openai/prompts';
import { apiError,success } from '@/lib/openai/errors';
import { checkOrigin,readJson } from '@/lib/openai/request';
export const runtime='nodejs';
export async function POST(request:Request){try{
 checkOrigin(request);const data=storyRequestSchema.parse(await readJson(request));
 const input={storyType:data.storyType,writingTone:data.writingTone,
  'VERIFIED VISUAL FACTS':data.photoAnalysis.map(p=>({id:p.id,order:p.order,capturedAt:p.capturedAt,observations:p.observations})),
  'VERIFIED USER CONTEXT':data.contextAnswers.filter(a=>a.answer.trim()),
  'UNVERIFIED / UNCERTAIN INFERENCES':data.photoAnalysis.map(p=>({id:p.id,inferences:p.uncertainInferences})),
  'ORGANIZATIONAL GROUPING ONLY':data.timeline.chapters.map(c=>({photoIds:c.photoIds})),
 };
 const result=await structured('generated_story',storySchema,data.storyType==='fiction'?FICTION_STORY_SYSTEM_PROMPT:MEMORY_STORY_SYSTEM_PROMPT,[{role:'user',content:JSON.stringify(input)}]);
 const ids=new Set(data.photoAnalysis.map(p=>p.id));
 result.coverPhotoId=ids.has(result.coverPhotoId)?result.coverPhotoId:data.photoAnalysis[0].id;
 result.sections=result.sections.map(s=>({...s,relatedPhotoIds:[...new Set(s.relatedPhotoIds.filter(id=>ids.has(id)))]}));
 return success(result);
}catch(error){return apiError(error);}}
