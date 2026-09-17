import type { ApiResult } from '@/types/story';
export async function api<T>(path:string,body:unknown,signal?:AbortSignal):Promise<T>{
 const multipart=body instanceof FormData;
 const response=await fetch(path,{method:'POST',headers:multipart?undefined:{'Content-Type':'application/json'},body:multipart?body:JSON.stringify(body),signal:signal??AbortSignal.timeout(110_000)});
 let result:ApiResult<T>;
 try{result=await response.json();}catch{throw new Error('연결이 원활하지 않아요. 잠시 후 다시 시도해 주세요.');}
 if(!response.ok||!result.success)throw new Error(result.success?'요청을 완료하지 못했어요.':result.error.message);
 return result.data;
}
