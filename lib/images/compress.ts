import type { UploadedPhoto } from '@/types/story';
export const MAX_PHOTOS=20;
export async function preparePhoto(file:File):Promise<UploadedPhoto>{
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('이 파일 형식은 현재 지원하기 어려워요. JPEG 또는 PNG로 변환한 뒤 다시 업로드해 주세요.');
 if(file.size>30*1024*1024)throw new Error('30MB 이하의 사진을 선택해 주세요.');
 const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});
 try{
  if(bitmap.width*bitmap.height>80_000_000)throw new Error('사진 해상도가 너무 높아요. 크기를 줄인 뒤 다시 올려 주세요.');
  const canvas=document.createElement('canvas');const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
  canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('사진을 읽을 수 없어요.');
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
  let blob:Blob|null=null;
  for(const quality of [.8,.66,.5,.36]){blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/jpeg',quality));if(blob&&blob.size<=210_000)break;}
  if(!blob||blob.size>210_000){canvas.width=Math.round(canvas.width*.7);canvas.height=Math.round(canvas.height*.7);ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/jpeg',.45));}
  if(!blob||blob.size>210_000)throw new Error('사진 압축이 어려워요. 다른 사진을 선택해 주세요.');
  let capturedAt:string|undefined;
  try{const exifr=await import('exifr');const tags=await exifr.parse(file,['DateTimeOriginal']);const date=tags?.DateTimeOriginal;if(date instanceof Date&&!isNaN(date.getTime())&&date.getFullYear()>1990&&date.getTime()<Date.now()+86_400_000)capturedAt=date.toISOString();}catch{/* Missing or malformed EXIF must never prevent upload. */}
  return {id:crypto.randomUUID(),order:0,name:file.name,src:URL.createObjectURL(file),optimized:blob,capturedAt};
 }finally{bitmap.close();}
}
export function orderPhotos(photos:UploadedPhoto[],manuallyOrdered:boolean){const sorted=!manuallyOrdered&&photos.every(p=>p.capturedAt)?[...photos].sort((a,b)=>a.capturedAt!.localeCompare(b.capturedAt!)):photos;return sorted.map((p,i)=>({...p,order:i+1}));}
