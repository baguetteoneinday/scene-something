import { finalizeQuestions } from '@/lib/story/questions';
import type { FictionGenre } from '@/lib/story/formats';
import type { Creativity } from '@/lib/story/style';
import { emptyLetterDetails } from '@/types/story';
import type { Analysis, UploadedPhoto, MissingContextQuestion, GeneratedStory, StoryType, WritingTone, UserContextAnswer, LetterDetails } from '@/types/story';
export const demoPhotos:UploadedPhoto[]=[{id:'demo_01',src:'/demo/photo-01.jpg',order:1,name:'바다의 여백'},{id:'demo_02',src:'/demo/photo-02.jpg',order:2,name:'해안을 따라'},{id:'demo_03',src:'/demo/photo-03.jpg',order:3,name:'커피 한 잔'}];
const scenes=['옅은 하늘 아래 바다와 젖은 모래사장이 보인다.','밝은 절벽 아래 자갈 해안을 걷는 한 사람이 보인다.','나무 테이블 위 흰 커피 잔과 받침, 숟가락이 놓여 있다.'];
export const demoPhotoAnalysis:Analysis['photoAnalysis']=demoPhotos.map((p,i)=>({id:p.id,order:p.order,capturedAt:null,scene:scenes[i],locationType:null,timeOfDay:null,peopleCount:i===1?1:0,activities:i===1?['걷기']:[],objects:i===2?['컵','받침','숟가락','테이블']:['바다',i===0?'모래':'자갈'],foods:i===2?['커피']:[],observations:[scenes[i]],uncertainInferences:[]}));
export const demoTimeline:Analysis['timeline']={periodSummary:'바다와 해안, 커피가 있는 장면',chapters:demoPhotos.map((p,i)=>({id:`chapter_${i}`,title:p.name,photoIds:[p.id],description:scenes[i],verifiedFacts:[scenes[i]]})),possibleTheme:null};
export const demoQuestions:MissingContextQuestion[]=finalizeQuestions([
 {id:'place',question:'바다와 해안은 어디에서 남긴 기억인가요?',reason:'정확한 장소 확인',photoIds:['demo_01','demo_02']},
 {id:'people',question:'이 시간을 혼자 보냈나요, 누군가와 함께했나요?',reason:'함께한 사람 확인',photoIds:[]},
 {id:'photo',question:'이 해안에서 어떤 일을 했고, 어떤 생각이 들었나요?',reason:'장면 밖의 경험',photoIds:['demo_02']},
 {id:'connection',question:'커피를 마시던 때 나눈 이야기나 기억나는 일이 있나요?',reason:'사진 밖의 기억',photoIds:['demo_03']},
],demoPhotos.map(p=>p.id));
export const demoStoryVariants:Record<WritingTone,[string,string,string]>={
 plain:['바다는 옅은 하늘과 맞닿아 있었다. 젖은 모래에는 작은 돌들이 흩어져 있었다.','밝은 절벽 아래로 자갈 해안이 이어졌다. 큰 절벽 곁에서는 사람의 모습이 작았다.','나무 테이블 위에는 커피 한 잔이 놓여 있었다. 흰 잔 옆에 작은 숟가락이 있었다.'],
 emotional:['하늘과 바다 사이의 경계가 옅었다. 젖은 모래에 남은 빛까지 부드럽게 이어졌다.','절벽은 크고 그 아래의 발걸음은 작았다. 넓은 풍경 속에서도 작은 것은 사라지지 않았다.','흰 잔 하나가 나무 테이블 위에 놓여 있었다. 넓은 바다와 달리 두 손 가까이에 놓일 크기였다.'],
 witty:['바다는 넓고 모래 위 돌들은 작았다.','절벽 아래로 자갈 해안이 이어졌다.','테이블 위에는 커피가 놓여 있었다.'],
 cinematic:['하늘 아래, 긴 수평선. 물결이 모래에 닿았다. 빛은 젖은 자리에 남았다.','절벽 아래 길이 이어졌다. 자갈 사이로 한 사람이 걸었다.','나무 테이블 위의 흰 잔. 그 옆에 놓인 숟가락. 넓은 풍경과 가까운 물건이 서로 다른 거리로 남았다.'],
 literary:['바다는 하늘과 맞닿은 선을 길게 펼쳤다. 젖은 모래는 그 아래의 빛을 받아 적었다.','절벽은 높고 발걸음은 작았다. 그 둘 사이에도 길은 이어졌다.','커피를 감싼 둥근 테두리. 작은 잔 하나에도 안과 밖이 있었다.'],
};
function makeDemoDraft(type:StoryType,tone:WritingTone,answers:UserContextAnswer[],version=0,letter:LetterDetails=emptyLetterDetails):GeneratedStory {
 const memory=answers.filter(a=>a.answer.trim()).map(a=>a.answer.trim());
 const details=[
 '넓은 것과 작은 것은 같은 자리에 있었다. 바다를 하나의 풍경으로 부를 때도 모래 위 작은 돌들이 없어지는 것은 아니었다.',
 '크기만으로는 남는 것의 무게를 가늠하기 어렵다. 절벽 아래 작은 발걸음이 넓은 풍경만큼 또렷할 때도 있다.',
 '무엇이 오래 남는지는 크기로 정해지지 않는다. 바다와 커피 한 잔 사이에도 각자의 자리가 있었다.'
 ];
 const imagined:string[]=[];
 if(type==='letter'){
  const recipient=letter.recipient.trim()||'그날의 나';const polite=letter.speechStyle==='polite';
  const opening=polite?'이 시간에 대해 전하고 싶은 말을 편지에 담아요.':'이 시간에 대해 전하고 싶은 말을 편지에 담아.';
  const sections=demoStoryVariants[tone].map((scene,i)=>({heading:null,paragraphs:[...(i===0?[`${recipient}에게,`,opening]:[]),scene,...(i===1?[polite?'이 기억에 덧붙일 말이 있다면 당신에게 먼저 전하고 싶어요.':'이 기억에 덧붙일 말이 있다면 너에게 먼저 전하고 싶어.']:[]),...(imagined[i]?[imagined[i]]:[]),...memory.filter((_,j)=>j%3===i)],relatedPhotoIds:[demoPhotos[i].id]}));
  sections.push({heading:null,paragraphs:[...(letter.message.trim()?[letter.message.trim()]:[]),polite?'이 사진들과 함께 편지를 전합니다.':'이 사진들과 함께 편지를 전해.',...(letter.sender.trim()?[`${letter.sender.trim()} ${polite?'드림':'씀'}`]:[])],relatedPhotoIds:[]});
  return {title:`${recipient}에게`,subtitle:'사진에 담아 건네는 편지',coverPhotoId:'demo_02',sections};
 }
 const titles:Record<StoryType,string>={record:'사진으로 남겨 둔 하루',essay:'바다와 한 잔 사이',travel:'세 장면의 여행 기록',letter:'그날의 나에게',fiction:'사진 속 세 장면'};
 const headings:Record<StoryType,string[]>={record:['사진을 펼치며','함께 남은 장면','기록의 끝'],essay:['바다의 여백','풍경 속의 사람','작은 장면 하나'],travel:['첫 번째 풍경','해안의 한 장면','커피가 있는 자리'],letter:['그날의 나에게','이 장면도 기억하니','사진을 덮기 전에'],fiction:['바다의 장면','해안의 장면','커피의 장면']};
 const paragraphs=[...demoStoryVariants[tone]];

 if(type==='travel')paragraphs[0]='바다와 해안, 커피가 있던 시간을 기록한다. '+paragraphs[0];
 if(type==='essay'&&version%2)paragraphs[2]+=' 사진이 남긴 것은 장면이고, 그 사이를 채우는 것은 지금 적는 문장이다.';
 return {title:titles[type],subtitle:version%2?'사진 사이에 남겨 둔 기록':'세 장의 사진, 하나의 이야기',coverPhotoId:'demo_02',sections:paragraphs.map((text,i)=>({heading:headings[type][i],paragraphs:[text,...(type==='essay'?[details[i]]:[]),...(imagined[i]?[imagined[i]]:[]),...memory.filter((_,j)=>j%3===i).map(value=>value)],relatedPhotoIds:[demoPhotos[i].id]}))};
}

export function makeDemoStory(type:StoryType,tone:WritingTone,answers:UserContextAnswer[],version=0,letter:LetterDetails=emptyLetterDetails,creativity:Creativity=type==='fiction'?100:25,plan?:{photoIds:string[]}[],genre:FictionGenre='literary'):GeneratedStory {
 let draft=makeDemoDraft(type,tone,answers,version,letter);
 if(type==='fiction')draft=makeGenreDemo(genre);
 if(type==='record'||type==='travel'){
  const memories=answers.filter(a=>a.answer.trim()).sort((a,b)=>Number(b.questionId==='final_memory')-Number(a.questionId==='final_memory'));
  const links=creativity===0?[]:creativity===25?['하늘 아래로는 물결이, 물결 아래로는 모래사장이 이어졌다.','밝은 절벽과 자갈 해안이 나란히 이어져 있었다.','테이블 위의 잔과 받침은 같은 흰색이었다.']:creativity===50?['하늘과 물결, 젖은 모래가 서로 다른 결로 한자리에 이어졌다.','넓은 해안과 작은 발걸음이 크기의 대비를 이루었다.','바다와 절벽의 넓은 윤곽에 이어, 잔의 작은 윤곽이 남았다.']:creativity===75?['옅은 하늘에서 시작된 풍경은 물결을 지나 젖은 모래의 작은 돌들까지 이어졌다.','절벽 아래로 이어진 해안에는 큰 것과 작은 것이 저마다의 자리를 차지하고 있었다.','넓은 바다와 가까운 잔, 서로 다른 크기의 장면들이 이 기록을 이루었다.']:['바다와 모래가 맞닿은 선은 길게 이어졌고, 작은 돌들은 그 곁에 쉼표처럼 놓여 있었다.','절벽과 발걸음 사이에는 커다란 문장과 작은 쉼표 같은 대비가 있었다.','바다의 긴 선과 잔의 둥근 선. 서로 다른 윤곽이 만나 하나의 기록으로 이어졌다.'];
  draft.title=type==='record'?'바다와 커피 사이':'바다와 해안의 여행 기록';
  draft.sections=demoStoryVariants[tone].map((scene,i)=>({heading:['바다 곁에서','해안을 따라','커피 한 잔'][i],paragraphs:[...memories.filter((_,j)=>j%3===i).map(a=>a.answer.trim()),scene,...(links[i]?[links[i]]:[])],relatedPhotoIds:[demoPhotos[i].id]}));
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

function makeGenreDemo(genre:FictionGenre):GeneratedStory{
 const plots:Record<FictionGenre,{title:string;parts:string[]}>={
 literary:{title:'돌을 돌려놓는 일',parts:['서윤은 아버지가 남긴 상자에서 작은 돌 하나를 발견했다. 쪽지에는 해변의 이름 대신 “돌려놓을 것”이라고만 적혀 있었다. 돌을 들고 바닷가에 도착했지만, 비슷한 돌이 너무 많았다. 어디가 제자리인지 알 수 없었다. 서윤은 절벽 아래를 걷는 노인에게 돌을 보여 주었다. 노인은 한참 보더니 자기도 그런 돌을 집에 두고 산다고 했다.','“왜 가져가셨어요?” 서윤이 물었다. 노인은 대답 대신 발치의 돌을 하나 집었다가 내려놓았다. “가져갈 때는 이유가 있었겠지.” 서윤은 아버지에게 묻지 못한 일들을 떠올렸다. 돌의 출처보다 묻지 않았다는 사실이 마음에 걸렸다. 아무 돌이나 내려놓으면 끝날 일이었지만 손은 좀처럼 펴지지 않았다.','카페에서 서윤은 빈 쪽지 뒤에 오늘 만난 노인의 말을 적었다. 정답을 찾았다고 쓰지는 않았다. 잔을 비운 뒤 해변으로 돌아가 돌을 내려놓았다. 오래 고르지 않았다. 대신 그 자리에 잠깐 앉아 있었다. 바다는 돌 하나가 돌아왔다는 사실을 모르는 듯했다. 서윤은 상자에 돌 대신 넣을 쪽지를 다시 접었다.']},
 romance:{title:'두 잔의 약속',parts:['지안은 해변 카페에서 잘못 나온 커피를 받았다. 종이띠에는 “오늘은 말할 것”이라고 적혀 있었다. 옆자리의 남자가 당황하며 잔을 바꾸자고 했다. 그는 오래전 함께 여행했던 도현이었다. 두 사람은 서로의 이름을 부른 뒤에야 웃었다.','도현은 해안을 따라 걸으며 그때 연락하지 못한 이유를 꺼냈다. 지안은 끝까지 듣고도 바로 괜찮다고 하지 않았다. “나는 네가 싫어진 줄 알았어.” 도현이 고개를 들었다. 두 사람이 지나온 시간은 같았지만 그 시간에 붙인 이름은 달랐다.','카페로 돌아왔을 때 지안은 두 잔을 주문했다. “다음에는 종이에 쓰지 말고 직접 말해.” 도현은 이번 주에도 만나고 싶다고 말했다. 지안은 날짜부터 정하자고 했다. 큰 약속은 아니었다. 달력에 적을 수 있을 만큼 작고 분명한 시작이었다.']},
 mystery:{title:'세 번째 잔',parts:['문을 닫은 해변 카페에 매일 아침 따뜻한 커피가 놓였다. 주인 은서는 열쇠를 바꾸었지만 다음 날에도 잔은 있었다. 모래 한 알 없는 바닥과 젖은 받침만이 단서였다. 동네 사람들은 절벽 길로 누가 다닌다고 했다. 은서는 새벽부터 문 앞을 지켰다.','아무도 들어오지 않았는데 안에서 잔 부딪히는 소리가 났다. 은서는 뒤편 작은 창 아래 물자국을 발견했다. 창문은 안에서 잠겨 있었지만 커피 잔 하나가 지날 틈은 있었다. 그녀는 손님용 잔 세 개 중 하나의 손잡이만 반대쪽을 향한다는 것도 알아챘다.','다음 날 은서는 창 아래에서 배달원 동생을 만났다. 그는 돌아가신 어머니의 부탁을 멋대로 오래 지키고 있었다. “누나 밥 못 챙길 때 따뜻한 거라도.” 은서는 열쇠를 바꿔 미안하다고 하지 않았다. 대신 문을 열고 잔 두 개를 꺼냈다. 혼자 두고 가는 일은 이제 그만하자고 했다.']},
 fantasy:{title:'바다가 빌려준 하루',parts:['해변의 작은 가게는 물건 대신 하루를 빌려주었다. 값을 치르는 방법은 단 하나, 그날의 가장 소중한 기억을 돌려주는 것이었다. 유나는 놓친 작별 인사를 하려고 문을 열었다. 주인은 커피 한 잔이 식기 전까지 돌아오라고 했다.','다시 만난 친구는 유나가 왜 울먹이는지 몰랐다. 유나는 붙잡을 말을 준비했지만 함께 걷는 동안 친구가 얼마나 멀리 가고 싶어 했는지 처음 들었다. 시간이 줄어들수록 하고 싶은 말은 짧아졌다. “잘 다녀와.” 그 말을 하는 순간 바다가 길 위로 번지기 시작했다.','가게로 돌아온 유나는 기억을 내놓았다. 친구 얼굴은 흐려졌지만 자신이 붙잡지 않았다는 사실은 남았다. 주인은 빈 잔을 거두며 말했다. “기억은 받아도 네가 한 선택까지 가져가지는 못해.” 유나는 이유 모를 서운함을 안고도 문을 나설 수 있었다.']},
 sf:{title:'저장되지 않은 파도',parts:['모든 기억을 자동 저장하는 도시에서 바닷가만 기록이 끊겼다. 복원 기사 이안은 오류를 찾으러 해안으로 갔다. 사람들은 그곳에서 만나면 서로의 말을 녹음할 수 없다는 것을 이미 알고 있었다. 이안은 카페 주인에게 마지막으로 무엇을 잊었는지 물었다.','주인은 대답 대신 저장 장치를 내려놓으라고 했다. 이안은 잠깐이면 된다고 생각했지만, 기록되지 않는 대화가 시작되자 자꾸 확인하고 싶어졌다. 놓친 문장을 돌려 들을 수 없었다. 그는 처음으로 상대의 말을 중간에 끊지 않고 끝까지 들었다.','보고서에는 복구가 불가능하다고 썼다. 기술적으로는 거짓말이었다. 그러나 마지막 항목에는 사실을 적었다. 이 구역을 이용하는 사람들에게 먼저 동의를 받아야 한다고. 이안은 돌아가는 길에 커피 맛을 저장하려다 멈췄다. 내일 다시 와서 기억하면 될 일이었다.']},
 healing:{title:'내일도 여는 가게',parts:['수진은 가게를 닫기로 한 날 손님 하나를 받았다. 손님은 메뉴판 대신 창밖 바다를 오래 보더니 가장 싼 커피를 주문했다. 계산대 아래에는 폐업 안내문이 있었다. 수진은 종이를 뒤집어 놓고 잔을 꺼냈다.','손님은 동네의 가게 이름을 손으로 적는 일을 하고 있었다. 지도에서 사라진 곳도 버리지 않는다고 했다. 수진은 자기 가게 이름 옆에 뭐라고 쓸 건지 물었다. “아직은 모르죠. 커피를 마시는 중이니까.” 수진은 처음으로 그날 잔을 급히 치우지 않았다.','문을 닫을 때 손님은 다음 주에도 오겠다고 하지 않았다. 그저 잘 마셨다고 했다. 수진은 폐업 안내문을 찢지 않았다. 대신 그 위에 하루 더 생각해 보기라고 적었다. 큰 결심은 아니었지만, 다음 날 쓸 잔을 씻어 놓을 이유로는 충분했다.']}
 };
 const plot=plots[genre];return {title:plot.title,subtitle:'사진에서 시작된 짧은 단편소설',coverPhotoId:'demo_02',sections:plot.parts.map((text,i)=>({heading:['시작','갈림길','남은 것'][i],paragraphs:[text],relatedPhotoIds:[demoPhotos[i].id]}))};
}
