import 'server-only';
import { ZodError } from 'zod';
export class AppError extends Error { constructor(public code:string,message:string,public status=400){super(message);} }
export function apiError(error:unknown){
 let code='SERVICE_ERROR',message='잠시 연결이 원활하지 않아요. 잠시 후 다시 시도해 주세요.',status=502;
 if(error instanceof AppError){({code,message,status}=error);}
 else if(error instanceof ZodError){code='INVALID_DATA';message='전달된 내용을 확인하지 못했어요. 다시 시도해 주세요.';status=400;}
 else if(error instanceof SyntaxError){code='INVALID_REQUEST';message='요청을 읽지 못했어요. 다시 시도해 주세요.';status=400;}
 else if(error && typeof error==='object'){
 const e=error as {status?:number;name?:string};
 if(e.status===429){code='RATE_LIMIT';status=429;message='요청이 잠시 몰렸어요. 잠시 후 다시 시도해 주세요.';}
 else if(e.status===401||e.status===403){code='AUTH_ERROR';status=503;message='이야기 만들기 연결을 확인 중이에요. 샘플 체험은 계속 이용할 수 있어요.';}
 else if(e.name?.includes('Timeout')||e.name==='AbortError'){code='TIMEOUT';status=504;message='응답이 조금 늦어지고 있어요. 사진과 기억은 그대로예요. 다시 시도해 주세요.';}
 else if(e.status===400){code='INVALID_REQUEST';status=400;message='사진이나 입력 내용을 처리하기 어려워요. 사진 수를 줄이거나 다시 시도해 주세요.';}
 }
 return Response.json({success:false,error:{code,message}},{status,headers:{'Cache-Control':'no-store'}});
}
export function success<T>(data:T){return Response.json({success:true,data},{headers:{'Cache-Control':'no-store'}});}
