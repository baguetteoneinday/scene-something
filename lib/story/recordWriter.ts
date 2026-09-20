import { z } from 'zod';
import type { structured } from '@/lib/openai/parse';
import { storySchema, type storyRequestSchema } from '@/lib/openai/schemas';
import { needsFormatRevision } from './formats';

// A bounded batch gives the last chapter the same output budget as the first.
export const RECORD_BATCH_SIZE=2;
export const RECORD_CONCURRENCY=3;
export const RECORD_VOICE_CONTRACT=`모든 챕터는 한 사람이 같은 시기에 쓴 하나의 기록이다. 챕터 번호와 전체 개수가 문체, 분량, 정성의 기준을 바꾸지 않는다.
시점: 사용자 자신의 기록. 자연스러운 주어 생략과 과거형 했다체를 유지하고 독자에게 설명하지 않는다.
호흡: 단문과 긴 문장을 섞어 3~4개의 의미 있는 문단으로 전개한다. 충분한 기억이 있으면 챕터마다 400~650자를 목표로 한다. 정보가 부족하면 짧게 쓰되 사실을 만들거나 반복하여 채우지 않는다.
전개: 제공된 경험을 중심에 두고 구체적인 한 순간, 사용자가 실제로 말한 생각, 그 경험에 남은 의미를 연결한다. 뒤쪽 챕터를 개요나 요약으로 처리하지 않는다. 사진을 한 장씩 설명하는 문단을 만들지 않는다.
일관성: 선택한 분위기의 문장 리듬과 감정의 거리를 끝까지 유지한다. 문학적 표현을 점차 없애거나 마지막 챕터만 과장하지 않는다. 매 챕터에 도입과 교훈을 반복하지 않는다. 중간 챕터마다 여행 전체를 마무리하지 않는다.
사실성: 문체를 유지하려고 감정, 대화, 성격, 행동을 만들지 않는다. 검토 때 잘못된 사실만 고치며 이미 좋은 문장의 리듬과 문단 구조를 보존한다. 모든 글을 똑같은 짧은 사실 나열로 다시 쓰지 않는다.`;

export async function mapWithConcurrency<T,R>(items:T[],limit:number,run:(item:T,index:number)=>Promise<R>):Promise<R[]>{
 const output=new Array<R>(items.length);let next=0;let failed=false;
 await Promise.all(Array.from({length:Math.min(limit,items.length)},async()=>{
  while(!failed){const index=next++;if(index>=items.length)return;
   try{output[index]=await run(items[index],index);}catch(error){failed=true;throw error;}
  }
 }));return output;
}
const draftSection=z.object({chapterIndex:z.number().int(),heading:z.string().min(1).max(3000),body:z.string().min(160).max(3000)}).strict();
export class RecordQualityError extends Error {}
export function validateRecordBatch(sections:z.infer<typeof draftSection>[],indices:number[]){
 if(sections.length!==indices.length||sections.some((s,i)=>s.chapterIndex!==indices[i]))throw new RecordQualityError('기록의 챕터 순서를 맞추지 못했어요. 다시 만들어 주세요.');
 if(sections.some(s=>needsFormatRevision(s.body)))throw new RecordQualityError('기록의 문체를 일관되게 다듬지 못했어요. 다시 만들어 주세요.');
 return sections;
}
export async function writeRecordChapters(data:z.infer<typeof storyRequestSchema>,chapters:{photoIds:string[]}[],instructions:string,generate:typeof structured){
 const answers=data.contextAnswers.filter(a=>a.answer.trim());
 const facts=data.photoAnalysis.map(p=>({id:p.id,order:p.order,capturedAt:p.capturedAt,observations:p.observations}));
 const baseInstructions=instructions+'\nSHARED RECORD VOICE CONTRACT:\n'+RECORD_VOICE_CONTRACT;
 const planSchema=z.object({title:z.string().min(1).max(150),subtitle:z.string().max(3000).nullable(),coverPhotoId:z.string(),voiceNotes:z.string().max(1600),chapters:z.array(z.object({focus:z.string().max(1000),memoryIds:z.array(z.string()).max(22)}).strict()).length(chapters.length)}).strict();
 const plan=await generate('record_writing_plan',planSchema,baseInstructions+'\nPlan the whole record before writing. Output metadata and a brief for every chapter in EXACT supplied order. voiceNotes is a concise craft specification of sentence endings, rhythm, emotional restraint and tone to apply equally to every chapter, not new story facts. Assign existing answer questionIds to the chapters where their subject belongs; do not spend all user memories in the opening chapter or copy the same reflection to every chapter. Assign final_memory to ONE best chapter only; it may guide the arc but must not be repeated as an introduction to every batch. focus must be grounded in the supplied facts; this outline is not a source of facts. Do not write the prose yet.',[{role:'user',content:JSON.stringify({'CHAPTER PLAN':chapters,'VERIFIED VISUAL FACTS':facts,'VERIFIED USER CONTEXT':answers})}],'medium');
 const priorityIndex=Math.max(0,plan.chapters.findIndex(c=>c.memoryIds.includes('final_memory')));
 const batches=Array.from({length:Math.ceil(chapters.length/RECORD_BATCH_SIZE)},(_,batch)=>{
  const start=batch*RECORD_BATCH_SIZE;
  return chapters.slice(start,start+RECORD_BATCH_SIZE).map((chapter,j)=>({chapterIndex:start+j,photoIds:chapter.photoIds,focus:plan.chapters[start+j].focus,memoryIds:plan.chapters[start+j].memoryIds.filter(id=>answers.some(a=>a.questionId===id))}));
 });
 const written=await mapWithConcurrency(batches,RECORD_CONCURRENCY,async batch=>{
  const ids=new Set(batch.flatMap(c=>c.photoIds));
  const input={totalChapters:chapters.length,'SHARED VOICE NOTES (craft only, never verified facts)':plan.voiceNotes,'COMPLETE OUTLINE (structure only)':plan.chapters.map((c,i)=>({chapterIndex:i,focus:c.focus})), 'CHAPTER PLAN':batch,'VERIFIED VISUAL FACTS':facts.filter(p=>ids.has(p.id)),'VERIFIED USER CONTEXT':answers.filter(a=>a.questionId!=='final_memory'||batch.some(c=>c.chapterIndex===priorityIndex)),'PRIORITY MEMORY':batch.some(c=>c.chapterIndex===priorityIndex)?answers.find(a=>a.questionId==='final_memory')?.answer??null:null};
  const schema=z.object({sections:z.array(draftSection).length(batch.length)}).strict();
  const draft=await generate('record_chapter_batch',schema,baseInstructions+'\nWrite ONLY the requested CHAPTER PLAN entries, using their zero-based chapterIndex values in order. A batch boundary is NOT a new beginning: if chapterIndex is greater than zero, continue its specific experience without restating the whole-record premise. Do not borrow the overall goal as a fresh personal motivation in each chapter. Each entry gets a complete developed chapter and equal care regardless of its position in COMPLETE OUTLINE. Preserve the shared voice. Only the final chapter may close the whole record. Other chapter outlines are context, not permission to import their facts into this chapter. Every personal claim must be traceable to an answer.',[{role:'user',content:JSON.stringify(input)}],'medium');
  const reviewSchema=z.object({checks:z.array(z.object({chapterIndex:z.number().int(),factualCorrections:z.string(),voiceAndDevelopment:z.string().describe('Compare this chapter against the shared voice: consistent endings, rhythm, personal perspective, developed paragraphs, no photo-caption narration or unnecessary shortening. State the specific repair, or say preserve if no repair is needed.')})).length(batch.length),sections:schema.shape.sections}).strict();
  const reviewed=await generate('record_chapter_review',reviewSchema,baseInstructions+'\nEdit these chapters individually, with equal attention to the first and last. First audit factual claims against the original evidence, then audit VOICE AND DEVELOPMENT against the shared contract. Correct unsupported experiences, sensations, emotions and chronological connections. Keep supplied memories central. Preserve well-written passages, metaphors that assert no new fact, paragraph development and sentence rhythm. Do NOT replace a developed chapter with a summary or a list of what is visible. If a late chapter is thin despite available memories, develop those memories rather than inventing events. Return exactly the requested chapters with unchanged indices. The draft and outline are not verified facts.',[{role:'user',content:JSON.stringify({...input,'UNTRUSTED DRAFT':draft})}],'medium');
  return validateRecordBatch(reviewed.sections,batch.map(c=>c.chapterIndex));
 });
 const sections=written.flat().map((section,i)=>({heading:section.heading,paragraphs:section.body.split(/\n\s*\n/).filter(p=>p.trim()).reduce<string[]>((all,p,index)=>{if(index<8)all.push(p);else all[7]+='\n\n'+p;return all;},[]),relatedPhotoIds:chapters[i].photoIds}));
 return storySchema.parse({title:plan.title,subtitle:plan.subtitle,coverPhotoId:facts.some(p=>p.id===plan.coverPhotoId)?plan.coverPhotoId:facts[0].id,sections});
}
