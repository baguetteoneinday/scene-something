import { z } from 'zod';
import { structured } from '@/lib/openai/parse';
import { storyRequestSchema,storySchema } from '@/lib/openai/schemas';
import { STORY_SYSTEM_PROMPT } from '@/lib/openai/prompts';
import { apiError,success } from '@/lib/openai/errors';
import { checkOrigin,readJson } from '@/lib/openai/request';
import { planChapters } from '@/lib/story/chapters';
import { toneGuides } from '@/lib/story/style';
export const runtime='nodejs';
export async function POST(request:Request){try{
 checkOrigin(request);const data=storyRequestSchema.parse(await readJson(request));
 const chapters=planChapters(data);
 const input={storyType:data.storyType,writingTone:data.writingTone,
  CREATIVITY:data.creativity??(data.storyType==='fiction'?100:0),
  'TONE CRAFT GUIDE':toneGuides[data.writingTone],
  'CHAPTER PLAN':chapters,
  ...(data.storyType==='letter'?{'VERIFIED LETTER DETAILS':data.letterDetails??{}}:{}),
  'VERIFIED VISUAL FACTS':data.photoAnalysis.map(p=>({id:p.id,order:p.order,capturedAt:p.capturedAt,observations:p.observations})),
  'VERIFIED USER CONTEXT':data.contextAnswers.filter(a=>a.answer.trim()),
 };
 const section=storySchema.shape.sections.element.omit({paragraphs:true}).extend({body:z.string().min(chapters.length>=10?260:360).max(2400)});
 const schema=storySchema.extend({sections:z.array(section).length(chapters.length)});
 const result=await structured('generated_story',schema,STORY_SYSTEM_PROMPT,[{role:'user',content:JSON.stringify(input)}]);
 const ids=new Set(data.photoAnalysis.map(p=>p.id));
 result.coverPhotoId=ids.has(result.coverPhotoId)?result.coverPhotoId:data.photoAnalysis[0].id;
 const sections=result.sections.map((section,i)=>({heading:data.storyType==='letter'?null:section.heading,paragraphs:section.body.split(/\n\s*\n/).filter(p=>p.trim()).reduce<string[]>((all,p,i)=>{if(i<8)all.push(p);else all[7]+='\n\n'+p;return all;},[]),relatedPhotoIds:chapters[i].photoIds}));
 return success(storySchema.parse({...result,sections}));
}catch(error){return apiError(error);}}
