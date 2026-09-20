'use client';
import { Slider } from '@/components/ui/slider';
import { useStorySession } from '@/context/StorySessionContext';
import { creativityDescriptions, reconstructionLabels, type Creativity } from '@/lib/story/style';
export function ReconstructionControl({disabled}:{disabled:boolean}){
 const {state,patch}=useStorySession();
 return <fieldset disabled={disabled} className="creativity-fieldset reconstruction"><legend><span>03</span> 재구성 정도</legend><p id="reconstruction-help" className="small-note">사진과 기억을 연결하며, 감정과 생각을 얼마나 보완할지 선택해 주세요.</p><div className="reconstruction-ends"><span>사실 그대로</span><span>자유롭게 재구성</span></div><Slider disabled={disabled} thumbProps={{'aria-label':'재구성 정도','aria-describedby':'reconstruction-help reconstruction-detail','aria-valuetext':reconstructionLabels[state.creativity]}} value={[state.creativity]} min={0} max={100} step={25} onValueChange={([value])=>patch({creativity:value as Creativity})}/><p id="reconstruction-detail" className="small-note" aria-live="polite"><strong>{reconstructionLabels[state.creativity]}</strong> · {creativityDescriptions[state.creativity]}</p><p className="small-note">오른쪽으로 갈수록 적지 않은 감정도 더할 수 있어요. 직접 들려주신 마음을 우선하며, 새로운 사건은 만들지 않아요.</p></fieldset>;
}
