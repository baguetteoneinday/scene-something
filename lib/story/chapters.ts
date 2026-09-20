import type { Analysis } from '@/types/story';
function boundaries(analysis:Analysis){
 const photos=[...analysis.photoAnalysis].sort((a,b)=>a.order-b.order);
 const groups=new Map<string,number>();analysis.timeline.chapters.forEach((c,i)=>c.photoIds.forEach(id=>{if(!groups.has(id))groups.set(id,i);}));
 let lastTime:number|undefined;
 const cuts=photos.map((p,i)=>{
  const time=p.capturedAt?Date.parse(p.capturedAt):NaN;
  const gap=Number.isFinite(time)&&lastTime!==undefined?Math.abs(time-lastTime):0;
  if(Number.isFinite(time))lastTime=time;
  const changed=i>0&&groups.has(p.id)&&groups.has(photos[i-1].id)&&groups.get(p.id)!==groups.get(photos[i-1].id);
  return {hard:i>0&&gap>=86_400_000,score:gap>=3_600_000?10+Math.min(8,gap/3_600_000):changed?6:0,reason:gap>=86_400_000?'24시간 이상 간격 · 반드시 분리':gap>=3_600_000?'촬영 시간 간격':changed?'장면 변화':'사진 수 균형'};
 });
 const starts=[0,...cuts.flatMap((c,i)=>c.hard?[i]:[]),photos.length];
 const lengths=starts.slice(1).map((end,i)=>end-starts[i]);
 return {photos,cuts,starts,lengths};
}
export function chapterCountOptions(input:number|Analysis){
 const lengths=typeof input==='number'?[input]:boundaries(input).lengths;
 const min=lengths.reduce((sum,n)=>sum+Math.ceil(n/4),0);
 const max=lengths.reduce((sum,n)=>sum+Math.max(1,Math.floor(n/2)),0);
 return Array.from({length:Math.max(0,max-min+1)},(_,i)=>min+i);
}
export function planChapters(analysis:Analysis,requestedCount?:number|null){
 const {photos,cuts,starts}=boundaries(analysis);const options=chapterCountOptions(analysis);
 const memo=new Map<string,{score:number;sizes:number[]}|null>();
 function solve(start:number,left:number):{score:number;sizes:number[]}|null{
  if(!left)return start===photos.length?{score:0,sizes:[]}:null;
  const key=`${start}:${left}`;if(memo.has(key))return memo.get(key)!;
  const segmentEnd=starts.find(n=>n>start)??photos.length;
  const singleton=starts.includes(start)&&segmentEnd-start===1;
  let best:{score:number;sizes:number[]}|null=null;
  for(let size=singleton?1:2;size<=4;size++){
   if(start+size>segmentEnd)continue;
   const rest=solve(start+size,left-1);if(!rest)continue;
   // Extra chapters must earn their place through time or scene changes.
   const score=rest.score+(start?cuts[start].score-4:0)-Math.pow(size-3,2)*.2;
   if(!best||score>best.score)best={score,sizes:[size,...rest.sizes]};
  }
  memo.set(key,best);return best;
 }
 const counts=requestedCount!=null&&options.includes(requestedCount)?[requestedCount]:options;
 let best:{score:number;sizes:number[]}|null=null;
 for(const count of counts){const candidate=solve(0,count);if(candidate&&(!best||candidate.score>best.score))best=candidate;}
 let offset=0;
 return (best?.sizes??[]).map(size=>{const start=offset;offset+=size;return {photoIds:photos.slice(start,offset).map(p=>p.id),reason:start?cuts[start].reason:'이야기의 시작'};});
}
