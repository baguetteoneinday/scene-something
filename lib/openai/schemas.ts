import {chapterCountOptions} from '@/lib/story/chapters';
import { z } from 'zod';
const text = z.string().max(3000);
const texts = z.array(text).max(30);
const id = z.string().min(1).max(80);
export const photoSchema = z.object({
  id, order: z.number().int().min(1).max(20), capturedAt: z.string().nullable(), scene: text,
  locationType: text.nullable(), timeOfDay: text.nullable(), peopleCount: z.number().int().min(0).nullable(),
  activities: texts, objects: texts, foods: texts, observations: texts, uncertainInferences: texts,
}).strict();
export const analysisSchema = z.object({
  photoAnalysis: z.array(photoSchema).min(3).max(20),
  timeline: z.object({periodSummary: text, chapters: z.array(z.object({id, title: text, photoIds: z.array(id).max(20),description: text, verifiedFacts:texts}).strict()).min(1).max(10), possibleTheme: text.nullable()}).strict(),
}).strict();
export const questionsSchema = z.object({questions: z.array(z.object({id,question: text,reason:text,photoIds:z.array(id).max(20)}).strict()).max(22)}).strict();
export const storySchema = z.object({title: z.string().min(1).max(150),subtitle:text.nullable(),coverPhotoId:id,
  sections:z.array(z.object({heading:text.nullable(),paragraphs:z.array(z.string().min(1).max(6000)).min(1).max(8),relatedPhotoIds:z.array(id).max(20)}).strict()).min(1).max(20),
}).strict();
export const letterDetailsSchema = z.object({recipient:z.string().max(100),message:z.string().max(2000),sender:z.string().max(100),speechStyle:z.enum(['casual','polite'])}).strict();
export const storyRequestSchema = analysisSchema.extend({fictionGenre:z.enum(['literary','romance','mystery','fantasy','sf','healing']).optional(),chapterCount:z.number().int().min(1).max(20).nullable().optional(),creativity:z.union([z.literal(0),z.literal(25),z.literal(50),z.literal(75),z.literal(100)]).optional(),letterDetails:letterDetailsSchema.optional(),contextAnswers:z.array(z.object({questionId:id,question:text,answer:z.string().max(2000)}).strict()).max(22),storyType:z.enum(['record','travel','fiction']),writingTone:z.enum(['plain','emotional','witty','cinematic','literary'])}).strict().superRefine((data,ctx)=>{
 if(data.chapterCount!=null&&!chapterCountOptions(data).includes(data.chapterCount))ctx.addIssue({code:z.ZodIssueCode.custom,path:['chapterCount'],message:'한 챕터에 사진 2~4장을 담을 수 있는 개수를 선택해 주세요.'});
});
