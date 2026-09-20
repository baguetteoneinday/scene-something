'use client';
/* eslint-disable @next/next/no-img-element */
import type {UploadedPhoto} from '@/types/story';
export function QuestionPhotos({ids,photos}:{ids:string[];photos:UploadedPhoto[]}){
 const related=ids.map(id=>photos.find(p=>p.id===id)).filter((p):p is UploadedPhoto=>!!p);
 if(!related.length)return null;
 return <div className="question-photos" aria-label="이 질문에 해당하는 사진">{related.map(p=><figure key={p.id}><a href={p.src} target="_blank" rel="noreferrer" aria-label={`${p.order}번 사진 크게 보기`}><img src={p.src} alt={`${p.order}번 사진: ${p.name}`}/></a><figcaption>사진 {p.order} · 눌러서 크게 보기</figcaption></figure>)}</div>;
}
