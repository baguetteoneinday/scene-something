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
export const questionsSchema = z.object({questions: z.array(z.object({id,question: text,reason:text}).strict()).max(3)}).strict();
export const storySchema = z.object({title: z.string().min(1).max(150),subtitle:text.nullable(),coverPhotoId:id,
  sections:z.array(z.object({heading:text.nullable(),paragraphs:z.array(z.string().min(1).max(6000)).min(1).max(8),relatedPhotoIds:z.array(id).max(20)}).strict()).min(1).max(8),
}).strict();
export const storyRequestSchema = analysisSchema.extend({contextAnswers:z.array(z.object({questionId:id,question:text,answer:z.string().max(2000)}).strict()).max(3),storyType:z.enum(['diary','essay','travel','letter','fiction']),writingTone:z.enum(['plain','emotional','witty','cinematic','literary'])}).strict();
