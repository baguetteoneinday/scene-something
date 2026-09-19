'use client';
import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import { emptyLetterDetails, type LetterDetails } from '@/types/story';
import type { Analysis, UploadedPhoto, MissingContextQuestion, UserContextAnswer, StoryType, WritingTone, GeneratedStory } from '@/types/story';
export type Session = { letterDetails:LetterDetails; uploadedPhotos:UploadedPhoto[]; analysis:Analysis|null; contextQuestions:MissingContextQuestion[]; contextAnswers:UserContextAnswer[]; storyType:StoryType; writingTone:WritingTone; generatedStory:GeneratedStory|null; isDemo:boolean; demoRevision:number; generatedStoryType:StoryType; generatedWritingTone:WritingTone; manuallyOrdered:boolean };
const initial:Session={letterDetails:emptyLetterDetails,uploadedPhotos:[],analysis:null,contextQuestions:[],contextAnswers:[],storyType:'essay',writingTone:'plain',generatedStory:null,isDemo:false,demoRevision:0,generatedStoryType:'essay',generatedWritingTone:'plain',manuallyOrdered:false};
type Action={type:'patch';value:Partial<Session>}|{type:'reset'};
function reducer(state:Session,action:Action):Session { return action.type==='reset'?initial:{...state,...action.value}; }
const Context=createContext<{state:Session;patch:(value:Partial<Session>)=>void;reset:()=>void}|null>(null);
export function StorySessionProvider({children}:{children:ReactNode}) {
 const [state,dispatch]=useReducer(reducer,initial);
 const patch=useCallback((value:Partial<Session>)=>dispatch({type:'patch',value}),[]);
 function reset(){state.uploadedPhotos.forEach(p=>{if(p.src.startsWith('blob:'))URL.revokeObjectURL(p.src)});dispatch({type:'reset'});}
 return <Context.Provider value={{state,patch,reset}}>{children}</Context.Provider>;
}
export function useStorySession(){const value=useContext(Context);if(!value)throw new Error('Session provider missing');return value;}
