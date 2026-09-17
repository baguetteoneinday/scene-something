import type { Metadata } from 'next';
import { StorySessionProvider } from '@/context/StorySessionContext';
import './globals.css';
export const metadata:Metadata={title:'Between — 사진과 사진 사이의 이야기',description:'사진과 사진 사이에 남겨진 기억을 하나의 이야기로 완성합니다. Photos → Memories → Story.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="ko"><body><StorySessionProvider>{children}</StorySessionProvider></body></html>;}
