import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analysisSchema, questionsSchema, storySchema, storyRequestSchema } from '../lib/openai/schemas';
import { demoPhotoAnalysis, demoTimeline, demoQuestions, demoPhotos, makeDemoStory } from '../lib/demo/demoData';
import { orderPhotos } from '../lib/images/compress';
import { storyTypes, tones } from '../types/story';
test('all available demo format/tone combinations produce valid stories with real image references',()=>{
 const ids=new Set(demoPhotos.map(p=>p.id));
 for(const t of storyTypes)for(const tone of tones){const story=storySchema.parse(makeDemoStory(t.id,tone.id,[]));assert.ok(ids.has(story.coverPhotoId));assert.ok(story.sections.every(s=>s.relatedPhotoIds.every(id=>ids.has(id))));assert.ok(story.sections.every(s=>s.paragraphs.join('').length>0));}
});
test('demo/schema agree; question schema accepts expanded sets and rejects more than twenty-two',()=>{assert.ok(analysisSchema.safeParse({photoAnalysis:demoPhotoAnalysis,timeline:demoTimeline}).success);assert.ok(questionsSchema.safeParse({questions:[]}).success);assert.ok(questionsSchema.safeParse({questions:demoQuestions}).success);assert.ok(!questionsSchema.safeParse({questions:Array.from({length:23},()=>demoQuestions[0])}).success);});
test('input validation rejects invalid formats, oversized answers and undersized collections',()=>{
 const input={photoAnalysis:demoPhotoAnalysis,timeline:demoTimeline,contextAnswers:[],storyType:'record',writingTone:'plain'};
 assert.ok(storyRequestSchema.safeParse(input).success);
 assert.ok(!storyRequestSchema.safeParse({...input,storyType:'unknown'}).success);
 assert.ok(!storyRequestSchema.safeParse({...input,photoAnalysis:demoPhotoAnalysis.slice(0,2)}).success);
 assert.ok(!storyRequestSchema.safeParse({...input,contextAnswers:[{questionId:'q',question:'Where?',answer:'x'.repeat(2001)}]}).success);
});
test('sort only when all timestamps are available and manual order always wins',()=>{
 const dated=demoPhotos.map((p,i)=>({...p,capturedAt:`2026-01-0${3-i}T12:00:00.000Z`}));
 assert.equal(orderPhotos(dated,false)[0].id,'demo_03');assert.equal(orderPhotos(dated,true)[0].id,'demo_01');
 const partial=dated.map((p,i)=>i===1?{...p,capturedAt:undefined}:p);assert.equal(orderPhotos(partial,false)[0].id,'demo_01');
 assert.deepEqual(orderPhotos(dated,false).map(p=>p.order),[1,2,3]);
});
test('nonempty user context is preserved verbatim without injecting HTML; empty answers add no facts',()=>{
 const text='<script>alert("hello")</script>';
 const story=makeDemoStory('essay','plain',[{questionId:'q',question:'Where?',answer:text}]);
 assert.ok(story.sections.some(s=>s.paragraphs.some(p=>p.includes(text))));
 const blank=makeDemoStory('essay','plain',[{questionId:'q',question:'Where?',answer:'  '}]);
 assert.deepEqual(blank,makeDemoStory('essay','plain',[]));
});

test('answers survive memory formats and server caps oversized answer sets',()=>{
 const answers=Array.from({length:5},(_,i)=>({questionId:`q${i}`,question:'기억?',answer:`고유한 기억 ${i}`}));
 for(const type of ['essay','letter','record','travel'] as const){const story=makeDemoStory(type,'plain',answers);for(const answer of answers)assert.ok(JSON.stringify(story).includes(answer.answer));}
 const input={photoAnalysis:demoPhotoAnalysis,timeline:demoTimeline,storyType:'record',writingTone:'plain',contextAnswers:answers};
 assert.ok(storyRequestSchema.safeParse(input).success);assert.ok(!storyRequestSchema.safeParse({...input,contextAnswers:Array.from({length:23},()=>answers[0])}).success);
});
test('letter honors recipient, intended message and signature without leaking into other formats',()=>{
 const details={recipient:'엄마',message:'그때 함께해 줘서 고마워요.',sender:'지호',speechStyle:'polite' as const};
 const story=makeDemoStory('letter','plain',[],0,details);
 assert.equal(story.title,'엄마에게');assert.ok(story.sections.every(s=>s.heading===null));
 assert.ok(JSON.stringify(story).includes(details.message));assert.ok(JSON.stringify(story).includes('지호 드림'));
 assert.deepEqual(makeDemoStory('essay','plain',[],0,details),makeDemoStory('essay','plain',[]));
 assert.equal(makeDemoStory('letter','plain',[]).title,'그날의 나에게');
 const input={photoAnalysis:demoPhotoAnalysis,timeline:demoTimeline,contextAnswers:[],storyType:'record',writingTone:'plain',letterDetails:details};
 assert.ok(storyRequestSchema.safeParse(input).success);assert.ok(!storyRequestSchema.safeParse({...input,letterDetails:{...details,recipient:'x'.repeat(101)}}).success);
});


test('all photo counts and chapter choices preserve order with 2–4 photos in each chapter',async()=>{
 const {planChapters,chapterCountOptions}=await import('../lib/story/chapters');
 for(let n=3;n<=20;n++){
  const photos=Array.from({length:n},(_,i)=>({...demoPhotoAnalysis[0],id:`p${i}`,order:i+1,capturedAt:new Date(Date.UTC(2026,8,1,i)).toISOString()}));
  const analysis={photoAnalysis:photos,timeline:demoTimeline};
  for(const count of [null,...chapterCountOptions(n)]){
   const plan=planChapters(analysis,count);
   if(count!==null)assert.equal(plan.length,count);
   assert.ok(plan.every(c=>c.photoIds.length>=2&&c.photoIds.length<=4));
   assert.deepEqual(plan.flatMap(c=>c.photoIds),photos.map(p=>p.id));
  }
 }
 assert.deepEqual(chapterCountOptions(20),[5,6,7,8,9,10]);
});
test('partition favors hour gap boundaries within requested count, with safe missing dates',async()=>{
 const {planChapters}=await import('../lib/story/chapters');
 const photos=Array.from({length:6},(_,i)=>({...demoPhotoAnalysis[0],id:`p${i}`,order:i+1,capturedAt:new Date(Date.UTC(2026,8,1,i<2?0:2, i)).toISOString()}));
 const analysis={photoAnalysis:photos,timeline:{...demoTimeline,chapters:[{...demoTimeline.chapters[0],photoIds:photos.map(p=>p.id)}]}};
 assert.deepEqual(planChapters(analysis,2).map(c=>c.photoIds.length),[2,4]);
 photos.forEach(p=>{p.capturedAt='';});assert.deepEqual(planChapters(analysis,2).map(c=>c.photoIds.length),[3,3]);
});
test('invalid chapter counts are rejected; demo record avoids photo explanations and follows plan',async()=>{
 const {planChapters}=await import('../lib/story/chapters');
 const base={photoAnalysis:demoPhotoAnalysis,timeline:demoTimeline,contextAnswers:[],storyType:'record',writingTone:'plain'};
 assert.ok(storyRequestSchema.safeParse({...base,chapterCount:1}).success);
 assert.ok(!storyRequestSchema.safeParse({...base,chapterCount:2}).success);
 for(const creativity of [0,25,50,75,100])assert.ok(storyRequestSchema.safeParse({...base,creativity}).success);
 assert.ok(!storyRequestSchema.safeParse({...base,creativity:30}).success);
 const plan=planChapters(base,1);
 const story=makeDemoStory('record','plain',[],0,undefined,0,plan);
 assert.equal(story.sections.length,1);assert.deepEqual(story.sections[0].relatedPhotoIds,demoPhotos.map(p=>p.id));
 assert.ok(!/사진|화면|프레임|보인다/.test(story.sections.flatMap(s=>s.paragraphs).join('')));
});

test('final memory question is always last, bounded to five, and photo references are safe',async()=>{
 const {finalizeQuestions}=await import('../lib/story/questions');
 const empty=finalizeQuestions([],[]);assert.equal(empty.length,1);assert.equal(empty[0].id,'final_memory');
 const questions=Array.from({length:7},(_,i)=>({id:`q${i}`,question:'이 장면은?',reason:'맥락',photoIds:['demo_01','demo_01','bad']}));
 const result=finalizeQuestions(questions,demoPhotos.map(p=>p.id));assert.equal(result.length,5);
 assert.equal(result.at(-1)!.question,'꼭 기록하고 싶은 기억이 있다면 적어주세요.');
 assert.ok(result.slice(0,-1).every(q=>q.photoIds.join()==='demo_01'));
 assert.equal(new Set(result.map(q=>q.id)).size,5);
 assert.equal(finalizeQuestions([{...questions[0],photoIds:['bad']}],['demo_01']).length,1);
});
test('every fiction genre has a distinct story and input rejects unsupported genres',async()=>{
 const {fictionGenres,needsFormatRevision}=await import('../lib/story/formats');
 const titles=new Set<string>();
 for(const genre of fictionGenres){const story=storySchema.parse(makeDemoStory('fiction','plain',[],0,undefined,100,undefined,genre.id));titles.add(story.title);assert.ok(!story.sections.some(s=>needsFormatRevision(s.paragraphs.join(''))));}
 assert.equal(titles.size,fictionGenres.length);
 const input={photoAnalysis:demoPhotoAnalysis,timeline:demoTimeline,contextAnswers:[],storyType:'fiction',writingTone:'plain'};
 assert.ok(storyRequestSchema.safeParse({...input,fictionGenre:'mystery'}).success);
 assert.ok(!storyRequestSchema.safeParse({...input,fictionGenre:'invalid'}).success);
 assert.ok(needsFormatRevision('이어지는 장면에서는 도로가 비어 있었다.'));
 assert.ok(!needsFormatRevision('드라마를 보다가 내 마음이 어떤지 생각해 보았다.'));
});

test('automatic chapter count responds to content and day gaps apply only to automatic counts',async()=>{
 const {planChapters,chapterCountOptions}=await import('../lib/story/chapters');
 function collection(n:number,step:number){const photos=Array.from({length:n},(_,i)=>({...demoPhotoAnalysis[0],id:`p${i}`,order:i+1,capturedAt:new Date(Date.UTC(2026,8,1)+i*step).toISOString()}));return {photoAnalysis:photos,timeline:{...demoTimeline,chapters:[{...demoTimeline.chapters[0],photoIds:photos.map(p=>p.id)}]}};}
 assert.equal(planChapters(collection(20,60000)).length,5);
 assert.equal(planChapters(collection(20,3600000)).length,10);
 const daily=collection(20,86400000);
 assert.equal(planChapters(daily).length,20);assert.deepEqual(chapterCountOptions(daily),[5,6,7,8,9,10]);
 assert.equal(planChapters(daily,5).length,5);
 const input={...daily,contextAnswers:[],storyType:'record',writingTone:'plain'};
 assert.ok(storyRequestSchema.safeParse({...input,chapterCount:5}).success);
 assert.ok(!storyRequestSchema.safeParse({...input,chapterCount:20}).success);
 assert.ok(!storyRequestSchema.safeParse({...input,storyType:'letter'}).success);
 assert.ok(!storyRequestSchema.safeParse({...input,storyType:'essay'}).success);
 const mixed=collection(6,60000);mixed.photoAnalysis[3].capturedAt=new Date(Date.UTC(2026,8,3)).toISOString();mixed.photoAnalysis[4].capturedAt='';mixed.photoAnalysis[5].capturedAt=new Date(Date.UTC(2026,8,5)).toISOString();
 const plan=planChapters(mixed);
 assert.deepEqual(plan.map(c=>c.photoIds.length),[3,2,1]);
 assert.deepEqual(plan.flatMap(c=>c.photoIds),mixed.photoAnalysis.map(p=>p.id));
});
test('question budgets grow with photo count and dates while keeping the final question',async()=>{
 const {questionLimit,finalizeQuestions}=await import('../lib/story/questions');
 assert.equal(questionLimit(3),5);assert.equal(questionLimit(10),8);assert.equal(questionLimit(20),13);
 const photos=Array.from({length:20},(_,i)=>({...demoPhotoAnalysis[0],id:`p${i}`,order:i+1,capturedAt:new Date(Date.UTC(2026,8,i+1)).toISOString()}));
 const analysis={photoAnalysis:photos,timeline:demoTimeline};assert.equal(questionLimit(analysis),22);
 const qs=Array.from({length:30},(_,i)=>({...demoQuestions[0],id:`q${i}`,photoIds:['p0']}));
 const result=finalizeQuestions(qs,photos.map(p=>p.id),questionLimit(analysis));assert.equal(result.length,22);assert.equal(result.at(-1)!.id,'final_memory');
});

test('reconstruction disclosures and factual demo boundaries are separate from fiction',async()=>{
 const {resultDisclosure,creativityLevels}=await import('../lib/story/style');
 for(const level of creativityLevels){
  assert.equal(Boolean(resultDisclosure(level,false)),level>=50);
  assert.match(resultDisclosure(level,true)!,/AI가 창작한 단편소설/);
  for(const type of ['record','travel'] as const){const story=makeDemoStory(type,'plain',[],0,undefined,level);assert.ok(!/상상 속 인물|서점|엽서|마음속으로|오늘은/.test(JSON.stringify(story)));}
 }
 assert.match(resultDisclosure(100,false)!,/실제 기억과 다른/);
 const base={photoAnalysis:demoPhotoAnalysis,timeline:demoTimeline,contextAnswers:[],writingTone:'plain'};
 assert.ok(storyRequestSchema.safeParse({...base,storyType:'record'}).success);
 assert.ok(!storyRequestSchema.safeParse({...base,storyType:'diary'}).success);
});
