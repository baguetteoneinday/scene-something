'use client';
import {useStorySession} from '@/context/StorySessionContext';
import {chapterCountOptions,planChapters} from '@/lib/story/chapters';
export function ChapterOptions({disabled}:{disabled:boolean}){
 const {state,patch}=useStorySession();if(!state.analysis)return null;
 const options=chapterCountOptions(state.analysis);
 const selected=state.chapterCount!=null&&options.includes(state.chapterCount)?state.chapterCount:null;
 const plan=planChapters(state.analysis,selected);
 return <fieldset disabled={disabled} className="creativity-fieldset"><legend><span>{state.storyType==='fiction'?'03':'04'}</span> 챕터 나누기</legend><div className="tone-options"><label className={`tone-chip ${selected===null?'selected':''}`}><input className="sr-only" type="radio" name="chapters" checked={selected===null} onChange={()=>patch({chapterCount:null})}/>자동 · {planChapters(state.analysis).length}개</label>{options.map(count=><label key={count} className={`tone-chip ${selected===count?'selected':''}`}><input className="sr-only" type="radio" name="chapters" checked={selected===count} onChange={()=>patch({chapterCount:count})}/>{count}개</label>)}</div><p className="small-note">사진 {state.analysis.photoAnalysis.length}장 · 기본 2~4장 · 날짜 경계에서는 1장 가능 · 최대 20장</p><p className="small-note">자동은 촬영 간격과 장면 변화에 따라 챕터 수까지 정합니다. 24시간 이상 차이는 반드시 나누며, 직접 고를 때도 이 경계를 유지합니다. 촬영 시간이 없는 사진은 순서와 장면을 참고합니다.</p><ol className="chapter-preview">{plan.map((chapter,i)=><li key={i}><strong>{i+1}장</strong><span>사진 {chapter.photoIds.map(id=>state.analysis!.photoAnalysis.find(p=>p.id===id)!.order).join(', ')} · {chapter.photoIds.length}장</span><small>{chapter.reason}</small></li>)}</ol></fieldset>;
}
