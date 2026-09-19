'use client';
import {useStorySession} from '@/context/StorySessionContext';
import {chapterCountOptions,planChapters} from '@/lib/story/chapters';
export function ChapterOptions({disabled}:{disabled:boolean}){
 const {state,patch}=useStorySession();if(!state.analysis)return null;
 const options=chapterCountOptions(state.analysis.photoAnalysis.length);
 const selected=state.chapterCount!=null&&options.includes(state.chapterCount)?state.chapterCount:null;
 const plan=planChapters(state.analysis,selected);
 return <fieldset disabled={disabled} className="creativity-fieldset"><legend><span>04</span> 챕터 나누기</legend><div className="tone-options"><label className={`tone-chip ${selected===null?'selected':''}`}><input className="sr-only" type="radio" name="chapters" checked={selected===null} onChange={()=>patch({chapterCount:null})}/>자동 · {planChapters(state.analysis).length}개</label>{options.map(count=><label key={count} className={`tone-chip ${selected===count?'selected':''}`}><input className="sr-only" type="radio" name="chapters" checked={selected===count} onChange={()=>patch({chapterCount:count})}/>{count}개</label>)}</div><p className="small-note">사진 {state.analysis.photoAnalysis.length}장 · 챕터마다 2~4장 · 최대 20장</p><p className="small-note">사진 순서를 유지하며 촬영 시간이 1시간 이상 벌어지는 곳을 우선 나눕니다. 선택한 개수와 사진 수에 따라 일부 시간 간격은 같은 챕터에 포함될 수 있어요.</p><ol className="chapter-preview">{plan.map((chapter,i)=><li key={i}><strong>{i+1}장</strong><span>사진 {chapter.photoIds.map(id=>state.analysis!.photoAnalysis.find(p=>p.id===id)!.order).join(', ')} · {chapter.photoIds.length}장</span></li>)}</ol></fieldset>;
}
