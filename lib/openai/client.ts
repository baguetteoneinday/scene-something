import 'server-only';
import OpenAI from 'openai';
import { AI_CONFIG } from './config';
import { AppError } from './errors';
export function getOpenAI(){
 const key=process.env.OPENAI_API_KEY;
 if(!key)throw new AppError('NOT_CONFIGURED','이야기 만들기를 준비 중이에요. 지금은 샘플로 전체 과정을 체험할 수 있어요.',503);
 return new OpenAI({apiKey:key,timeout:AI_CONFIG.timeoutMs,maxRetries:0});
}
