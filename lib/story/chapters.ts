import type { Analysis } from '@/types/story';
export function planChapters(analysis:Analysis){
 const photos=[...analysis.photoAnalysis].sort((a,b)=>a.order-b.order);
 const sceneGroup=new Map<string,number>();
 analysis.timeline.chapters.forEach((c,i)=>c.photoIds.forEach(id=>{if(!sceneGroup.has(id))sceneGroup.set(id,i);}));
 const chapters:{photoIds:string[];reason:string}[]=[];
 let lastTime:number|undefined;
 for(const [i,photo] of photos.entries()){
  const parsed=photo.capturedAt?Date.parse(photo.capturedAt):NaN;
  const time=Number.isFinite(parsed)?parsed:undefined;
  const gap=time!==undefined&&lastTime!==undefined&&Math.abs(time-lastTime)>=3_600_000;
  const previous=photos[i-1];
  const changed=previous&&sceneGroup.has(photo.id)&&sceneGroup.has(previous.id)&&sceneGroup.get(photo.id)!==sceneGroup.get(previous.id);
  const current=chapters.at(-1);
  if(!current||gap||changed||current.photoIds.length>=3)chapters.push({photoIds:[photo.id],reason:gap?'촬영 시간 1시간 이상 간격':changed?'장면 변화':current?'장면을 자세히 기록하기 위해 나눔':'이야기의 시작'});
  else current.photoIds.push(photo.id);
  if(time!==undefined)lastTime=time;
 }
 // A short collection still has room for an opening, development and ending.
 while(chapters.length<Math.min(3,photos.length)){
  const i=chapters.findIndex(c=>c.photoIds.length>1);if(i<0)break;
  const ids=chapters[i].photoIds;const tail=ids.splice(Math.ceil(ids.length/2));
  chapters.splice(i+1,0,{photoIds:tail,reason:'장면을 자세히 기록하기 위해 나눔'});
 }
 return chapters;
}
