import type { z } from 'zod';
import type { analysisSchema, questionsSchema, storySchema, letterDetailsSchema } from '@/lib/openai/schemas';
export type Analysis = z.infer<typeof analysisSchema>;
export type PhotoAnalysis = Analysis['photoAnalysis'][number];
export type StoryTimeline = Analysis['timeline'];
export type MissingContextQuestion = z.infer<typeof questionsSchema>['questions'][number];
export type GeneratedStory = z.infer<typeof storySchema>;
export type StoryType = 'record' | 'essay' | 'travel' | 'letter' | 'fiction';
export type WritingTone = 'plain' | 'emotional' | 'witty' | 'cinematic' | 'literary';
export type UploadedPhoto = { id: string; src: string; order: number; name: string; capturedAt?: string; optimized?: Blob };
export type UserContextAnswer = { questionId: string; question: string; answer: string; photoIds?: string[] };
export type ApiResult<T> = { success: true; data: T } | { success: false; error: { code: string; message: string } };
export const storyTypes: { id: StoryType; label: string; en: string; description: string }[] = [
  {id:'record',label:'기록',en:'Record',description:'사진 속 순간과 기억을 자연스러운 하나의 글로 남겨요.'},
  {id:'travel',label:'여행기',en:'Travel journal',description:'이동과 경험의 흐름을 중심으로 기록합니다.'},
  {id:'fiction',label:'소설',en:'Short story',description:'사진에서 영감을 받아 새로운 이야기를 만듭니다.'},
];
export const tones: { id: WritingTone; label: string }[] = [{id:'plain',label:'담백하게'},{id:'emotional',label:'감성적으로'},{id:'cinematic',label:'영화처럼'},{id:'literary',label:'문학적으로'}];

export type LetterDetails = z.infer<typeof letterDetailsSchema>;
export const emptyLetterDetails:LetterDetails = {recipient:'',message:'',sender:'',speechStyle:'casual'};
