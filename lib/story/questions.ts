import type { Analysis } from '@/types/story';
import {planChapters} from './chapters';
import type {MissingContextQuestion} from '@/types/story';
export const finalMemoryQuestion:MissingContextQuestion={id:'final_memory',question:'꼭 기록하고 싶은 기억이 있다면 적어주세요.',reason:'사용자가 가장 중요하게 남기고 싶은 기억을 듣습니다.',photoIds:[]};
export function questionLimit(input:number|Analysis){const n=typeof input==='number'?input:input.photoAnalysis.length;const chapters=typeof input==='number'?0:planChapters(input).length;return Math.min(22,Math.max(5,Math.ceil(n/2)+3,chapters+2));}
export function finalizeQuestions(questions:MissingContextQuestion[],validPhotoIds:string[],limit=questionLimit(validPhotoIds.length)):MissingContextQuestion[]{
 const valid=new Set(validPhotoIds);
 return [...questions.filter(q=>q.id!==finalMemoryQuestion.id&&(!q.photoIds?.length||q.photoIds.some(id=>valid.has(id)))).slice(0,Math.max(0,Math.min(22,limit)-1)).map((q,i)=>({...q,id:`context_${i+1}`,photoIds:[...new Set((q.photoIds??[]).filter(id=>valid.has(id)))]})),{...finalMemoryQuestion,photoIds:[]}];
}
