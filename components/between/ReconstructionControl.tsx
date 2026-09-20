'use client';
import { Slider } from '@/components/ui/slider';
import { useStorySession } from '@/context/StorySessionContext';
import { creativityDescriptions, reconstructionLabels, type Creativity } from '@/lib/story/style';
export function ReconstructionControl({disabled}:{disabled:boolean}){
 const {state,patch}=useStorySession();
 return <fieldset disabled={disabled} className="creativity-fieldset reconstruction"><legend><span>03</span> 재구성 정도</legend><p id="reconstruction-help" className="small-note">사진과 기억 사이의 빈 부분을 AI가 얼마나 자유롭게 연결할지 선택해 주세요.</p><div className="reconstruction-ends"><span>사실 그대로</span><span>자유롭게 재구성</span></div><Slider disabled={disabled} thumbProps={{'aria-label':'재구성 정도','aria-describedby':'reconstruction-help reconstruction-detail','aria-valuetext':reconstructionLabels[state.creativity]}} value={[state.creativity]} min={0} max={100} step={25} onValueChange={([value])=>patch({creativity:value as Creativity})}/><p id="reconstruction-detail" className="small-note" aria-live="polite"><strong>{reconstructionLabels[state.creativity]}</strong> · {creativityDescriptions[state.creativity]}</p><p className="small-note">어느 단계에서도 들려주신 기억을 우선하며, 새로운 사건을 만들어내지 않아요.</p></fieldset>;
}
