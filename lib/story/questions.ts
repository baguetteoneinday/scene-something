import type { Analysis } from '@/types/story';
import {planChapters} from './chapters';
import type {MissingContextQuestion} from '@/types/story';
export const finalMemoryQuestion:MissingContextQuestion={id:'final_memory',question:'꼭 기록하고 싶은 기억이 있다면 적어주세요.',reason:'사용자가 가장 중요하게 남기고 싶은 기억을 듣습니다.',photoIds:[]};
export function questionLimit(input:number|Analysis){const n=typeof input==='number'?input:input.photoAnalysis.length;const chapters=typeof input==='number'?0:planChapters(input).length;return Math.min(22,Math.max(5,Math.ceil(n/2)+3,chapters+2));}
export function finalizeQuestions(questions:MissingContextQuestion[],validPhotoIds:string[],limit=questionLimit(validPhotoIds.length)):MissingContextQuestion[]{
 const valid=new Set(validPhotoIds);
 return [...questions.filter(q=>q.id!==finalMemoryQuestion.id&&(!q.photoIds?.length||q.photoIds.some(id=>valid.has(id)))).slice(0,Math.max(0,Math.min(22,limit)-1)).map((q,i)=>({...q,id:`context_${i+1}`,photoIds:[...new Set((q.photoIds??[]).filter(id=>valid.has(id)))]})),{...finalMemoryQuestion,photoIds:[]}];
}

export function memoryQuestions(analysis:Analysis,additional:(MissingContextQuestion&{kind?:'context'|'emotion'})[]){
 const chapters=planChapters(analysis);const limit=questionLimit(analysis);
 const core=chapters.map((chapter,i)=>({id:`chapter_memory_${i+1}`,question:chapters.length===1?'이 장면들에서 꼭 남기고 싶은 경험이나 생각을 한 문장으로 적어주세요.':`${i+1}번째 기억에서 꼭 남기고 싶은 경험이나 생각을 한 문장으로 적어주세요.`,reason:'챕터의 중심이 될 기억',photoIds:chapter.photoIds}));
 const valid=new Set(analysis.photoAnalysis.map(p=>p.id));
 const usable=additional.filter(q=>!q.photoIds.length||q.photoIds.some(id=>valid.has(id)));
 const labels=[...analysis.photoAnalysis].sort((a,b)=>b.id.length-a.id.length);
 const clean=(q:MissingContextQuestion):MissingContextQuestion=>({id:q.id,question:labels.reduce((text,p)=>text.split(p.id).join(`${p.order}번 사진`),q.question),reason:q.reason,photoIds:q.photoIds});
 const emotional=usable.filter(q=>q.kind==='emotion').map(clean);
 const context=usable.filter(q=>q.kind!=='emotion').map(clean);
 const fallback={id:'feeling',question:'이 시간에 느꼈던 마음 중 지금도 남아 있는 것은 무엇인가요? 특별한 감정이 없었다면 그렇게 적어도 좋아요.',reason:'감정을 단정하지 않고 사용자의 마음을 듣습니다.',photoIds:[]};
 const extras=[...(emotional.length?emotional:[fallback]),...context];
 return finalizeQuestions([...core,...extras.slice(0,Math.max(1,limit-core.length-1))],analysis.photoAnalysis.map(p=>p.id),limit);
}
