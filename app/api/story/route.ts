import { z } from 'zod';
import { structured } from '@/lib/openai/parse';
import { storyRequestSchema,storySchema } from '@/lib/openai/schemas';
import { STORY_SYSTEM_PROMPT,FICTION_SYSTEM_PROMPT } from '@/lib/openai/prompts';
import { apiError,success,AppError } from '@/lib/openai/errors';
import { checkOrigin,readJson } from '@/lib/openai/request';
import { planChapters } from '@/lib/story/chapters';
import { fictionGenres,formatGuides,needsFormatRevision } from '@/lib/story/formats';
import { toneGuides,reconstructionGuides } from '@/lib/story/style';
export const runtime='nodejs';
export async function POST(request:Request){try{
 checkOrigin(request);const data=storyRequestSchema.parse(await readJson(request));
 const chapters=planChapters(data,data.chapterCount);
 const genre=fictionGenres.find(g=>g.id===(data.fictionGenre??'literary'))!;
 const instructions=(data.storyType==='fiction'?FICTION_SYSTEM_PROMPT:STORY_SYSTEM_PROMPT)+'\nFORMAT: '+formatGuides[data.storyType]+'\nTONE: '+toneGuides[data.writingTone]+(data.storyType==='fiction'?'\nGENRE: '+genre.label+' — '+genre.guide:'\nRECONSTRUCTION: '+reconstructionGuides[data.creativity??25]);
 const input={storyType:data.storyType,writingTone:data.writingTone,
  RECONSTRUCTION:data.storyType==='fiction'?100:(data.creativity??25),
  'FORMAT GUIDE':formatGuides[data.storyType],
  ...(data.storyType==='fiction'?{'FICTION GENRE':fictionGenres.find(g=>g.id===(data.fictionGenre??'literary'))}:{}),
  'TONE CRAFT GUIDE':toneGuides[data.writingTone],
  'CHAPTER PLAN':chapters,
  'VERIFIED VISUAL FACTS':data.photoAnalysis.map(p=>({id:p.id,order:p.order,capturedAt:p.capturedAt,observations:p.observations})),
  ...(data.storyType==='fiction'?{}:{'VERIFIED USER CONTEXT':data.contextAnswers.filter(a=>a.answer.trim())}),
  ...(data.storyType==='fiction'?{}:{'PRIORITY MEMORY TO PRESERVE':data.contextAnswers.find(a=>a.questionId==='final_memory')?.answer.trim()||null}),
 };
 const section=storySchema.shape.sections.element.omit({paragraphs:true}).extend({body:z.string().min(data.storyType==='fiction'?Math.max(360,Math.ceil(900/chapters.length)):(chapters.length>=10?120:160)).max(data.storyType==='fiction'?6000:2400)});
 const schema=storySchema.extend({sections:z.array(section).length(chapters.length)});
 const outputSchema=data.storyType==='fiction'?z.object({plot:z.object({protagonist:z.string(),goal:z.string(),conflict:z.string(),turningPoint:z.string(),resolution:z.string()}).strict(),...schema.shape,ending:z.string().min(200).max(2000)}).strict():schema;
 let result=await structured('generated_story',outputSchema,instructions,[{role:'user',content:JSON.stringify(input)}],'medium');
 if((data.storyType!=='fiction'||result.sections.some(s=>needsFormatRevision(s.body))||('ending' in result&&typeof result.ending==='string'&&needsFormatRevision(result.ending)))){
  const reviewSchema=z.object({corrections:z.array(z.string()).describe('List brief concrete unsupported claims to remove or correct, comparing the draft with the source facts. Include invented sensations, personal traits, scene transitions, thoughts, off-camera acts, emotions and descriptive photo commentary. Then apply every correction to the final text below.'),...outputSchema.shape}).strict();
  result=await structured('reviewed_story',reviewSchema,instructions+' FINAL EDITORIAL REVIEW: Treat the draft as untrusted. For record/travel, compare EVERY factual claim in title, subtitle, headings and body with VERIFIED VISUAL FACTS and VERIFIED USER CONTEXT. Delete unsupported first-person actions, emotions, sensory impressions, motives, exact locations, causal or chronological links, conversational details and same-day claims. In particular, photos alone do not support 쉬어 갔다, 눈이 편안해졌다, 걸음이 느려졌다, 조금 더 가면, 그날, 마음이 놓였다 or a coffee break after a walk. A supplied feeling permits faithful paraphrase, not additional anecdotes, thoughts or dialogue. For example 마음이 편해졌다 does not support 중간에 멈춰도 어색하지 않았다 or 별일 아닌 말까지 꺼냈다. Do not say 지금도 unless supplied. Keep user memories central and preserve the exact chapter plan. Rewrite removed passages as natural connections among confirmed details, without explaining missing evidence or reverting to image captions. With no answers, use the unifying visual motif without inventing the narrator doing anything. For fiction, preserve the plot and only correct caption-like voice. All returned text must be finished prose.',[{role:'user',content:JSON.stringify({...input,'DRAFT TO REVISE (not verified facts)':result})}],'medium');
 }
 if((result.sections.some(s=>needsFormatRevision(s.body))||('ending' in result&&typeof result.ending==='string'&&needsFormatRevision(result.ending))))throw new AppError('STYLE_RETRY','글의 문체를 자연스럽게 다듬지 못했어요. 다시 만들어 주세요.',502);
 const ids=new Set(data.photoAnalysis.map(p=>p.id));
 result.coverPhotoId=ids.has(result.coverPhotoId)?result.coverPhotoId:data.photoAnalysis[0].id;
 const sections=result.sections.map((section,i)=>({heading:section.heading,paragraphs:section.body.split(/\n\s*\n/).filter(p=>p.trim()).reduce<string[]>((all,p,i)=>{if(i<8)all.push(p);else all[7]+='\n\n'+p;return all;},[]),relatedPhotoIds:chapters[i].photoIds}));
 if('ending' in result&&typeof result.ending==='string'){const last=sections.at(-1)!;if(last.paragraphs.length<8)last.paragraphs.push(result.ending);else last.paragraphs[7]+='\n\n'+result.ending;}
 return success(storySchema.parse({title:result.title,subtitle:result.subtitle,coverPhotoId:result.coverPhotoId,sections}));
}catch(error){return apiError(error);}}
