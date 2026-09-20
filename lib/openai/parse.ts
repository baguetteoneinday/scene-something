import 'server-only';
import { z, type ZodTypeAny } from 'zod';
import { zodTextFormat } from 'openai/helpers/zod';
import type { ResponseInput } from 'openai/resources/responses/responses';
import { getOpenAI } from './client';
import { AI_CONFIG } from './config';
import { AppError } from './errors';
export async function structured<T extends ZodTypeAny>(name:string,schema:T,instructions:string,input:ResponseInput,reasoning:'low'|'medium'=AI_CONFIG.reasoning):Promise<z.infer<T>> {
 const response=await getOpenAI().responses.parse({model:AI_CONFIG.model,store:false,instructions,input,reasoning:{effort:reasoning},max_output_tokens:AI_CONFIG.maxOutputTokens,text:{format:zodTextFormat(schema,name)}});
 if(response.status!=='completed')throw new AppError('INCOMPLETE','이야기를 끝까지 완성하지 못했어요. 다시 시도해 주세요.',502);
 if(!response.output_parsed)throw new AppError('EMPTY_OUTPUT','이 사진으로 답변을 만들지 못했어요. 다른 사진이나 내용으로 다시 시도해 주세요.',502);
 const checked=schema.safeParse(response.output_parsed);
 if(!checked.success)throw new AppError('INVALID_OUTPUT','응답을 정리하는 중 문제가 생겼어요. 다시 시도해 주세요.',502);
 return checked.data;
}
