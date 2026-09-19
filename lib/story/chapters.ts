import type { Analysis } from '@/types/story';
export function chapterCountOptions(photoCount:number){
 const min=Math.ceil(photoCount/4),max=Math.floor(photoCount/2);
 return Array.from({length:Math.max(0,max-min+1)},(_,i)=>min+i);
}
export function planChapters(analysis:Analysis,requestedCount?:number|null){
 const photos=[...analysis.photoAnalysis].sort((a,b)=>a.order-b.order);
 const options=chapterCountOptions(photos.length);
 const count=requestedCount!=null&&options.includes(requestedCount)?requestedCount:Math.max(options[0]??1,Math.min(options.at(-1)??1,Math.round(photos.length/3)));
 const sceneGroup=new Map<string,number>();
 analysis.timeline.chapters.forEach((c,i)=>c.photoIds.forEach(id=>{if(!sceneGroup.has(id))sceneGroup.set(id,i);}));
 const boundaries=photos.map((photo,i)=>{
  const previous=photos[i-1];if(!previous)return {score:0,reason:'이야기의 시작'};
  const before=previous.capturedAt?Date.parse(previous.capturedAt):NaN;
  const after=photo.capturedAt?Date.parse(photo.capturedAt):NaN;
  const gap=Math.abs(after-before);
  if(Number.isFinite(gap)&&gap>=3_600_000)return {score:10+Math.min(8,gap/3_600_000),reason:'촬영 시간 간격'};
  const changed=sceneGroup.has(photo.id)&&sceneGroup.has(previous.id)&&sceneGroup.get(photo.id)!==sceneGroup.get(previous.id);
  return {score:changed?3:0,reason:changed?'장면 변화':'사진 수 균형'};
 });
 // Dynamic programming preserves order and every photo while satisfying 2–4 per chapter.
 const memo=new Map<string,{score:number;sizes:number[]}|null>();
 function solve(start:number,left:number):{score:number;sizes:number[]}|null{
  if(!left)return start===photos.length?{score:0,sizes:[]}:null;
  const key=`${start}:${left}`;if(memo.has(key))return memo.get(key)!;
  let best:{score:number;sizes:number[]}|null=null;
  for(let size=2;size<=4;size++){
   if(start+size>photos.length)continue;
   const rest=solve(start+size,left-1);if(!rest)continue;
   const score=rest.score+(start?boundaries[start].score:0)-Math.pow(size-photos.length/count,2)*.2;
   if(!best||score>best.score)best={score,sizes:[size,...rest.sizes]};
  }
  memo.set(key,best);return best;
 }
 let offset=0;
 return (solve(0,count)?.sizes??[photos.length]).map(size=>{const start=offset;offset+=size;return {photoIds:photos.slice(start,offset).map(p=>p.id),reason:boundaries[start]?.reason??'이야기의 시작'};});
}
