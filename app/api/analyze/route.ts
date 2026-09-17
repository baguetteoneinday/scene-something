import { z } from 'zod';
import type { ResponseInputContent } from 'openai/resources/responses/responses';
import { structured } from '@/lib/openai/parse';
import { analysisSchema } from '@/lib/openai/schemas';
import { ANALYSIS_SYSTEM_PROMPT } from '@/lib/openai/prompts';
import { apiError, AppError, success } from '@/lib/openai/errors';
import { checkOrigin, limitedBody } from '@/lib/openai/request';
export const runtime='nodejs';
const metadata=z.array(z.object({id:z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/),order:z.number().int().min(1).max(20),capturedAt:z.string().datetime().optional()}).strict()).min(3).max(20);
export async function POST(request:Request){try{
 checkOrigin(request);
 if(!request.headers.get('content-type')?.startsWith('multipart/form-data'))throw new AppError('CONTENT_TYPE','사진을 다시 선택해 주세요.',415);
 const bytes=await limitedBody(request,5_000_000);
 const form=await new Response(bytes as BodyInit,{headers:{'Content-Type':request.headers.get('content-type')!}}).formData();
 const meta=metadata.parse(JSON.parse(String(form.get('metadata'))));
 if(new Set(meta.map(p=>p.id)).size!==meta.length||meta.some((p,i)=>p.order!==i+1))throw new AppError('PHOTO_IDS','사진 순서를 확인해 주세요.');
 const files=form.getAll('photos');if(files.length!==meta.length)throw new AppError('PHOTO_COUNT','사진은 3장부터 20장까지 선택해 주세요.');
 const content:ResponseInputContent[]=[];
 for(let i=0;i<files.length;i++){
  const file=files[i];if(typeof file==='string'||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>230_000)throw new AppError('INVALID_IMAGE','사진 파일 형식 또는 크기를 확인해 주세요.');
  const buffer=Buffer.from(await file.arrayBuffer());
  const jpeg=buffer[0]===255&&buffer[1]===216&&buffer[2]===255;
  const png=buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const webp=buffer.subarray(0,4).toString()==='RIFF'&&buffer.subarray(8,12).toString()==='WEBP';
  if(!(file.type==='image/jpeg'?jpeg:file.type==='image/png'?png:webp))throw new AppError('INVALID_IMAGE','이미지 파일을 읽을 수 없어요. 다른 사진을 선택해 주세요.');
  content.push({type:'input_text',text:`PHOTO_ID: ${meta[i].id}\nORDER: ${meta[i].order}\nCAPTURED_AT: ${meta[i].capturedAt||'unknown'}`},{type:'input_image',image_url:`data:${file.type};base64,${buffer.toString('base64')}`,detail:'auto'});
 }
 const data=await structured('photo_analysis',analysisSchema,ANALYSIS_SYSTEM_PROMPT,[{role:'user',content}]);
 const ids=new Set(meta.map(p=>p.id));
 if(data.photoAnalysis.length!==meta.length||new Set(data.photoAnalysis.map(p=>p.id)).size!==ids.size||data.photoAnalysis.some(p=>!ids.has(p.id))||data.timeline.chapters.some(c=>c.photoIds.some(id=>!ids.has(id))))throw new AppError('INVALID_OUTPUT','사진의 흐름을 정리하지 못했어요. 다시 시도해 주세요.',502);
 data.photoAnalysis=meta.map(m=>({...data.photoAnalysis.find(p=>p.id===m.id)!,order:m.order,capturedAt:m.capturedAt||null}));
 return success(data);
}catch(error){return apiError(error);}}
