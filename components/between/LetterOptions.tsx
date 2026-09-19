'use client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useStorySession } from '@/context/StorySessionContext';
import type { LetterDetails } from '@/types/story';

export function LetterOptions({disabled}:{disabled:boolean}) {
 const {state,patch}=useStorySession();
 const details=state.letterDetails;
 function update(value:Partial<LetterDetails>){patch({letterDetails:{...details,...value}});}
 return <fieldset disabled={disabled} className="letter-options">
  <legend>누구에게 건네는 편지인가요?</legend>
  <p className="small-note">모두 선택 사항이에요. 받는 사람을 비워 두면 그날의 나에게 씁니다.</p>
  <div className="letter-names">
   <label htmlFor="letter-recipient">받는 사람<Input id="letter-recipient" value={details.recipient} maxLength={100} onChange={e=>update({recipient:e.target.value})} placeholder="예: 엄마, 함께 여행한 지수, 미래의 나"/></label>
   <label htmlFor="letter-sender">보내는 이름<Input id="letter-sender" value={details.sender} maxLength={100} onChange={e=>update({sender:e.target.value})} placeholder="편지 끝에 남길 이름"/></label>
  </div>
  <label htmlFor="letter-message">꼭 전하고 싶은 말<Textarea id="letter-message" value={details.message} maxLength={2000} rows={4} onChange={e=>update({message:e.target.value})} placeholder="이 사진을 보며 전하고 싶은 마음이나, 그때 미처 하지 못한 말을 들려주세요."/></label>
  <span className="character-count">{details.message.length} / 2,000</span>
  <fieldset className="letter-speech"><legend>상대에게 건네는 말투</legend><div className="tone-options">{([{id:'casual',label:'편안한 반말'},{id:'polite',label:'정중한 존댓말'}] as const).map(item=><label className={`tone-chip ${details.speechStyle===item.id?'selected':''}`} key={item.id}><input type="radio" name="letter-speech" value={item.id} checked={details.speechStyle===item.id} onChange={()=>update({speechStyle:item.id})}/>{item.label}</label>)}</div></fieldset>
 </fieldset>;
}
