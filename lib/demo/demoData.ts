import type { Creativity } from '@/lib/story/style';
import { emptyLetterDetails } from '@/types/story';
import type { Analysis, UploadedPhoto, MissingContextQuestion, GeneratedStory, StoryType, WritingTone, UserContextAnswer, LetterDetails } from '@/types/story';
export const demoPhotos:UploadedPhoto[]=[{id:'demo_01',src:'/demo/photo-01.jpg',order:1,name:'바다의 여백'},{id:'demo_02',src:'/demo/photo-02.jpg',order:2,name:'해안을 따라'},{id:'demo_03',src:'/demo/photo-03.jpg',order:3,name:'커피 한 잔'}];
const scenes=['옅은 하늘 아래 바다와 젖은 모래사장이 보인다.','밝은 절벽 아래 자갈 해안을 걷는 한 사람이 보인다.','나무 테이블 위 흰 커피 잔과 받침, 숟가락이 놓여 있다.'];
export const demoPhotoAnalysis:Analysis['photoAnalysis']=demoPhotos.map((p,i)=>({id:p.id,order:p.order,capturedAt:null,scene:scenes[i],locationType:null,timeOfDay:null,peopleCount:i===1?1:0,activities:i===1?['걷기']:[],objects:i===2?['컵','받침','숟가락','테이블']:['바다',i===0?'모래':'자갈'],foods:i===2?['커피']:[],observations:[scenes[i]],uncertainInferences:[]}));
export const demoTimeline:Analysis['timeline']={periodSummary:'바다와 해안, 커피가 있는 장면',chapters:demoPhotos.map((p,i)=>({id:`chapter_${i}`,title:p.name,photoIds:[p.id],description:scenes[i],verifiedFacts:[scenes[i]]})),possibleTheme:null};
export const demoQuestions:MissingContextQuestion[]=[{id:'place',question:'이 시간은 어디에서, 어떤 계기로 남긴 기억인가요?',reason:'장소와 목적은 사진만으로 알 수 없습니다.'},{id:'people',question:'혼자 보낸 시간인가요, 누군가와 함께했나요?',reason:'동행인의 관계는 확인할 수 없습니다.'},{id:'moment',question:'사진 밖에서 가장 오래 기억하고 싶은 순간은 무엇인가요?',reason:'개인적인 기억을 듣습니다.'},{id:'photo',question:'세 사진 중 특히 남기고 싶었던 장면과 그 이유는 무엇인가요?',reason:'사진을 찍은 이유는 확인할 수 없습니다.'},{id:'connection',question:'바다와 해안, 커피 사진은 어떤 흐름으로 이어지나요?',reason:'사진 사이의 실제 흐름은 확인할 수 없습니다.'}];
export const demoStoryVariants:Record<WritingTone,[string,string,string]>={
 plain:['바다의 가장자리에는 작은 돌들이 흩어져 있다. 옅은 하늘과 파도가 만나는 모습을 사진에 남겼다.','밝은 절벽 아래로 자갈 해안이 이어진다. 그 사이에 한 사람이 걷고 있다.','나무 테이블 위에는 커피 한 잔과 작은 숟가락이 놓여 있다. 바다와 해안, 그리고 이 잔. 세 장의 사진을 한자리에 놓아 본다.'],
 emotional:['젖은 모래 위로 하늘의 옅은 빛이 비친다. 수평선과 물결 사이의 작은 차이까지 사진 안에 남아 있다.','커다란 절벽 곁으로 한 사람의 모습이 작게 담겼다. 넓은 풍경과 작은 발걸음이 같은 장면을 이룬다.','흰 잔을 받친 나무 테이블. 멀리 펼쳐진 바다와 가까이 놓인 커피 사이에 사진 세 장만큼의 여백이 있다.'],
 witty:['모래사장에 작은 돌들이 듬성듬성 놓여 있다. 화면을 가장 넓게 차지하는 건 역시 바다다. 주연 자리가 확실하다.','이번 사진에는 절벽이 크게 등장한다. 걷는 사람은 작지만, 눈길은 자연스럽게 그쪽으로 향한다.','마지막 장면의 주인공은 커피 한 잔이다. 바다, 절벽, 커피. 크기는 점점 작아져도 사진 한 장의 자리는 똑같다.'],
 cinematic:['넓은 화면. 옅은 하늘 아래 물결이 길게 놓여 있다. 젖은 모래 위에는 빛이 남는다.','화면은 밝은 절벽으로 이어진다. 자갈 해안의 한쪽에 걷는 사람이 작게 보인다.','가까운 장면. 나무 테이블, 흰 잔, 그 옆의 숟가락. 서로 다른 크기의 풍경이 세 컷 안에 놓인다.'],
 literary:['바다는 가느다란 선으로 하늘과 맞닿아 있다. 모래 위의 물기는 그 선 아래 놓인 빛을 받아 적는다.','흰 절벽과 자갈 사이에 사람의 모습이 있다. 풍경이 차지한 넓이와 사람이 차지한 넓이가 한 장 안에서 만난다.','둥근 잔의 테두리가 커피를 감싼다. 프레임이 풍경을 담듯, 작은 잔도 제 안의 것을 담고 있다.'],
};
function makeDemoDraft(type:StoryType,tone:WritingTone,answers:UserContextAnswer[],version=0,letter:LetterDetails=emptyLetterDetails,creativity:Creativity=type==='fiction'?100:0):GeneratedStory {
 const memory=answers.filter(a=>a.answer.trim()).map(a=>a.answer.trim());
 const details=[
 '하늘과 바다가 만나는 가느다란 경계를 따라 시선을 옮긴다. 화면 가까이에는 젖은 모래가 있고, 그 너머에는 물결이 놓여 있다. 하나의 사진 안에서도 가까운 자리와 먼 자리가 서로 다른 결을 보여 준다. 이 풍경의 이름과 그날의 사정은 사진만으로 알 수 없다. 그래서 보이는 것부터 천천히 읽어 본다.',
 '절벽의 밝은 면과 발밑의 작은 자갈들이 서로 다른 크기로 담겨 있다. 사람의 모습은 그 사이에 놓여 있다. 사진을 오래 볼수록 큰 풍경만큼 작은 부분에도 시선이 간다. 누가 어디를 향해 걷는지 단정하는 대신, 이 장면에 함께 담긴 크기와 거리의 차이를 기록해 둔다.',
 '잔의 둥근 선 곁에 숟가락의 길쭉한 선이 놓인다. 사진의 범위는 앞선 바다와 해안보다 가까운 물건에 머문다. 넓게 펼쳐진 풍경과 손 가까이 놓일 법한 작은 물건을 나란히 보게 된다. 세 장을 한꺼번에 설명하기보다 각 장면이 보여 주는 만큼 문장을 남긴다.'
 ];
 const imagined=creativity===25?['사진의 여백을 편지지의 빈칸에 빗대어 본다.','절벽과 작은 사람의 대비는 커다란 책에 놓인 작은 쉼표를 닮았다.','잔의 둥근 테두리를 이 기록의 마침표에 빗대어 본다.']:creativity>=50?['상상 속에서는 파도가 아직 쓰지 않은 편지의 첫 줄처럼 밀려온다.','이 장면에서 시작한 상상 속 인물은 길 끝에 작은 서점을 발견한다.','상상 속 이야기의 끝에서 누군가 빈 엽서에 다음 만남의 장소를 적는다.']:[];
 if(type==='fiction'&&creativity>=75)return {title:version%2?'파도가 맡긴 문장':'아직 보내지 않은 편지',subtitle:'바다에서 시작된 짧은 소설',coverPhotoId:'demo_02',sections:[{heading:'밀려온 것',paragraphs:[({plain:'윤은 이름이 지워진 편지를 들고 바다 앞에 섰다. 마지막 줄에는 아직 도착하지 않은 사람을 기다린다고 적혀 있었다.',emotional:'접힌 편지 한 장을 품고 윤은 바다에 왔다. 누군가를 오래 기다렸다는 마지막 문장이 자꾸 마음에 걸렸다.',witty:'윤은 바다에 답을 물으러 왔다. 바다는 대답 대신 신발을 적셨다.',cinematic:'먼 수평선. 화면 아래 윤의 손이 들어온다. 접힌 편지에는 이름이 없다. 마지막 줄만 남아 있다. 아직 도착하지 않은 사람을 기다린다고.',literary:'편지에서 이름이 사라진 자리는 작았다. 윤은 그 작은 빈칸을 들고 바다에 왔다. 기다림이라는 단어가 종이의 마지막을 붙잡고 있었다.'})[tone]],relatedPhotoIds:['demo_01']},{heading:'해안의 문장',paragraphs:['절벽 아래를 걷는 동안 윤은 그 문장을 여러 번 고쳐 읽었다. 기다리는 사람도, 기다려지는 사람도 자신일 수 있다는 생각이 들었다. 바람이 종이 한쪽을 접었다. 마치 다음 장으로 넘어가라는 표시 같았다.'],relatedPhotoIds:['demo_02']},{heading:'새로운 수신인',paragraphs:['카페에 앉아 커피를 주문한 윤은 편지를 뒤집었다. 빈 뒷면에 짧게 적었다. “늦어도 괜찮아. 도착하면 여기서 만나.” 그리고 수신인 칸에 자신의 이름을 썼다.'],relatedPhotoIds:['demo_03']}]};
 if(type==='letter'){
  const recipient=letter.recipient.trim()||'그날의 나';const polite=letter.speechStyle==='polite';
  const opening=polite?'사진에 담긴 장면들을 편지로 건네요.':'사진에 담긴 장면들을 편지로 건네.';
  const sections=demoStoryVariants[tone].map((scene,i)=>({heading:null,paragraphs:[...(i===0?[`${recipient}에게,`,opening]:[]),scene,details[i],...(imagined[i]?[imagined[i]]:[]),...memory.filter((_,j)=>j%3===i)],relatedPhotoIds:[demoPhotos[i].id]}));
  sections.push({heading:null,paragraphs:[...(letter.message.trim()?[letter.message.trim()]:[]),polite?'이 사진들과 함께 편지를 전합니다.':'이 사진들과 함께 편지를 전해.',...(letter.sender.trim()?[`${letter.sender.trim()} ${polite?'드림':'씀'}`]:[])],relatedPhotoIds:[]});
  return {title:`${recipient}에게`,subtitle:'사진에 담아 건네는 편지',coverPhotoId:'demo_02',sections};
 }
 const titles:Record<StoryType,string>={diary:'사진으로 남겨 둔 하루',essay:'바다와 한 잔 사이',travel:'세 장면의 여행 기록',letter:'그날의 나에게',fiction:'사진 속 세 장면'};
 const headings:Record<StoryType,string[]>={diary:['사진을 펼치며','함께 남은 장면','기록의 끝'],essay:['바다의 여백','풍경 속의 사람','작은 장면 하나'],travel:['첫 번째 풍경','해안의 한 장면','커피가 있는 자리'],letter:['그날의 나에게','이 장면도 기억하니','사진을 덮기 전에'],fiction:['바다의 장면','해안의 장면','커피의 장면']};
 const paragraphs=[...demoStoryVariants[tone]];
 if(type==='diary')paragraphs[0]='오늘은 남겨 둔 사진을 펼쳐 보았다. '+paragraphs[0];
 if(type==='travel')paragraphs[0]='사진의 순서대로 풍경을 기록한다. '+paragraphs[0];
 if(type==='essay'&&version%2)paragraphs[2]+=' 사진이 남긴 것은 장면이고, 그 사이를 채우는 것은 지금 적는 문장이다.';
 return {title:titles[type],subtitle:version%2?'사진 사이에 남겨 둔 기록':'세 장의 사진, 하나의 이야기',coverPhotoId:'demo_02',sections:paragraphs.map((text,i)=>({heading:headings[type][i],paragraphs:[text,details[i],...(imagined[i]?[imagined[i]]:[]),...memory.filter((_,j)=>j%3===i).map(value=>`사진 밖의 기억도 적어 둔다.\n${value}`)],relatedPhotoIds:[demoPhotos[i].id]}))};
}

export function makeDemoStory(type:StoryType,tone:WritingTone,answers:UserContextAnswer[],version=0,letter:LetterDetails=emptyLetterDetails,creativity:Creativity=type==='fiction'?100:0,plan?:{photoIds:string[]}[]):GeneratedStory {
 const draft=makeDemoDraft(type,tone,answers,version,letter,creativity);
 if(type==='diary'){
  const scenes=[
   '옅은 하늘 아래로 바다가 길게 펼쳐져 있었다. 젖은 모래와 물결이 맞닿은 자리에는 작은 돌들이 흩어져 있었다. 멀리서는 하늘과 바다의 경계가 가늘게 이어졌다.',
   '밝은 절벽 아래로 자갈 해안이 이어졌다. 넓은 풍경 사이로 걷는 사람의 모습이 작았다. 절벽의 밝은 면과 발밑 자갈의 결이 나란히 놓여 있었다.',
   '나무 테이블 위에는 흰 커피 잔과 받침이 있었다. 잔 옆에는 작은 숟가락이 놓여 있었다. 넓게 펼쳐진 바다와 해안, 그리고 가까이 놓인 커피 한 잔까지. 오늘의 기록에 이 장면들을 함께 남긴다.'
  ];
  draft.title='바다와 커피가 있던 날';
  draft.sections=scenes.map((scene,i)=>({heading:['바다 곁에서','해안을 따라','커피 한 잔'][i],paragraphs:[scene,...answers.filter(a=>a.answer.trim()).filter((_,j)=>j%3===i).map(a=>a.answer.trim()),...(creativity>0?['잠시 마음속으로 이 하루에 작은 이름을 붙여 보았다. 서두르지 않는 날이라고.']:[])],relatedPhotoIds:[demoPhotos[i].id]}));
 }
 if(!plan)return draft;
 const used=new Set<number>();
 const sections=plan.map((chapter,i)=>{
  const matching=draft.sections.filter((section,j)=>{if(section.relatedPhotoIds.some(id=>chapter.photoIds.includes(id))){used.add(j);return true;}return false;});
  return {heading:type==='letter'?null:matching[0]?.heading??`${i+1}장`,paragraphs:matching.flatMap(s=>s.paragraphs),relatedPhotoIds:chapter.photoIds};
 });
 draft.sections.forEach((section,i)=>{if(!used.has(i))sections.at(-1)?.paragraphs.push(...section.paragraphs);});
 for(const section of sections)if(section.paragraphs.length>8)section.paragraphs=[...section.paragraphs.slice(0,7),section.paragraphs.slice(7).join('\n\n')];
 return {...draft,sections};
}
