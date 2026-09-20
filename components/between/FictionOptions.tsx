'use client';
import {useStorySession} from '@/context/StorySessionContext';
import {fictionGenres} from '@/lib/story/formats';
export function FictionOptions({disabled}:{disabled:boolean}){
 const {state,patch}=useStorySession();
 return <fieldset disabled={disabled} className="creativity-fieldset"><legend>어떤 장르의 소설을 읽고 싶나요?</legend><div className="tone-options">{fictionGenres.map(g=><label key={g.id} className={`tone-chip ${state.fictionGenre===g.id?'selected':''}`}><input className="sr-only" type="radio" name="fiction-genre" checked={state.fictionGenre===g.id} onChange={()=>patch({fictionGenre:g.id})}/>{g.label}</label>)}</div><p className="small-note">사진에서 소재를 얻어 인물·사건·대화와 결말이 있는 짧은 단편소설을 만듭니다. 소설은 자유로운 창작으로 생성됩니다.</p></fieldset>;
}
