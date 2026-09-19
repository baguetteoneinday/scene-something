import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analysisSchema, questionsSchema, storySchema, storyRequestSchema } from '../lib/openai/schemas';
import { demoPhotoAnalysis, demoTimeline, demoQuestions, demoPhotos, makeDemoStory } from '../lib/demo/demoData';
import { orderPhotos } from '../lib/images/compress';
import { storyTypes, tones } from '../types/story';
test('all 25 demo format/tone combinations produce valid stories with real image references',()=>{
 const ids=new Set(demoPhotos.map(p=>p.id));
 for(const t of storyTypes)for(const tone of tones){const story=storySchema.parse(makeDemoStory(t.id,tone.id,[]));assert.ok(ids.has(story.coverPhotoId));assert.ok(story.sections.every(s=>s.relatedPhotoIds.every(id=>ids.has(id))));assert.ok(story.sections.every(s=>s.paragraphs.join('').length>0));}
});
test('demo/schema agree; questions allow zero and five and reject six',()=>{assert.ok(analysisSchema.safeParse({photoAnalysis:demoPhotoAnalysis,timeline:demoTimeline}).success);assert.ok(questionsSchema.safeParse({questions:[]}).success);assert.ok(questionsSchema.safeParse({questions:demoQuestions}).success);assert.ok(!questionsSchema.safeParse({questions:[...demoQuestions,demoQuestions[0]]}).success);});
test('input validation rejects invalid formats, oversized answers and undersized collections',()=>{
 const input={photoAnalysis:demoPhotoAnalysis,timeline:demoTimeline,contextAnswers:[],storyType:'essay',writingTone:'plain'};
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

test('five answers survive all memory formats; sixth answer is rejected',()=>{
 const answers=Array.from({length:5},(_,i)=>({questionId:`q${i}`,question:'기억?',answer:`고유한 기억 ${i}`}));
 for(const type of ['essay','letter','diary','travel'] as const){const story=makeDemoStory(type,'plain',answers);for(const answer of answers)assert.ok(JSON.stringify(story).includes(answer.answer));}
 const input={photoAnalysis:demoPhotoAnalysis,timeline:demoTimeline,storyType:'letter',writingTone:'plain',contextAnswers:answers};
 assert.ok(storyRequestSchema.safeParse(input).success);assert.ok(!storyRequestSchema.safeParse({...input,contextAnswers:[...answers,answers[0]]}).success);
});
test('letter honors recipient, intended message and signature without leaking into other formats',()=>{
 const details={recipient:'엄마',message:'그때 함께해 줘서 고마워요.',sender:'지호',speechStyle:'polite' as const};
 const story=makeDemoStory('letter','plain',[],0,details);
 assert.equal(story.title,'엄마에게');assert.ok(story.sections.every(s=>s.heading===null));
 assert.ok(JSON.stringify(story).includes(details.message));assert.ok(JSON.stringify(story).includes('지호 드림'));
 assert.deepEqual(makeDemoStory('essay','plain',[],0,details),makeDemoStory('essay','plain',[]));
 assert.equal(makeDemoStory('letter','plain',[]).title,'그날의 나에게');
 const input={photoAnalysis:demoPhotoAnalysis,timeline:demoTimeline,contextAnswers:[],storyType:'letter',writingTone:'plain',letterDetails:details};
 assert.ok(storyRequestSchema.safeParse(input).success);assert.ok(!storyRequestSchema.safeParse({...input,letterDetails:{...details,recipient:'x'.repeat(101)}}).success);
});
