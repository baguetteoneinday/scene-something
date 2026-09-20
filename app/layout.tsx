import { BRAND, BRAND_DESCRIPTION } from '@/lib/brand';
import type { Metadata } from 'next';
import { StorySessionProvider } from '@/context/StorySessionContext';
import './globals.css';
export const metadata:Metadata={title:BRAND,description:BRAND_DESCRIPTION,openGraph:{title:BRAND,description:BRAND_DESCRIPTION,siteName:BRAND},twitter:{card:'summary',title:BRAND,description:BRAND_DESCRIPTION},icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="ko"><body><StorySessionProvider>{children}</StorySessionProvider></body></html>;}
