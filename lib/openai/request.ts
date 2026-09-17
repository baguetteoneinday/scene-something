import 'server-only';
import { AppError } from './errors';
export async function limitedBody(request:Request,limit:number){
 const declared=Number(request.headers.get('content-length')||0);
 if(declared>limit)throw new AppError('TOO_LARGE','한 번에 보낼 수 있는 크기를 넘었어요. 사진 수를 줄여 주세요.',413);
 const reader=request.body?.getReader();if(!reader)throw new AppError('EMPTY_REQUEST','전달된 내용이 없어요.');
 const chunks:Uint8Array[]=[];let size=0;
 try {while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw new AppError('TOO_LARGE','한 번에 보낼 수 있는 크기를 넘었어요. 사진 수를 줄여 주세요.',413);}chunks.push(value);}}
 finally{reader.releaseLock();}
 const out=new Uint8Array(size);let at=0;for(const chunk of chunks){out.set(chunk,at);at+=chunk.length;}return out;
}
export async function readJson(request:Request){if(!request.headers.get('content-type')?.includes('application/json'))throw new AppError('CONTENT_TYPE','올바르지 않은 요청이에요.',415);return JSON.parse(new TextDecoder().decode(await limitedBody(request,300_000)));}
export function checkOrigin(request:Request){const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)throw new AppError('ORIGIN','이 페이지에서 다시 시도해 주세요.',403);}
