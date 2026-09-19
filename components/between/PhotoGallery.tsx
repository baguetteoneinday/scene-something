'use client';
/* eslint-disable @next/next/no-img-element */
import {useState,useEffect,useRef} from 'react';
import type {UploadedPhoto} from '@/types/story';
export function PhotoGallery({photos}:{photos:UploadedPhoto[]}){
 const gallery=useRef<HTMLDivElement>(null);
 const [ratios,setRatios]=useState<Record<string,number>>({});
 useEffect(()=>{
  let active=true;const images=Array.from(gallery.current?.querySelectorAll('img')??[]);
  void Promise.all(images.map(img=>img.decode().catch(()=>{}))).then(()=>{
   if(!active)return;const next:Record<string,number>={};
   images.forEach(img=>{if(img.naturalWidth&&img.naturalHeight)next[img.dataset.photoId!]=img.naturalWidth/img.naturalHeight;});
   setRatios(old=>Object.entries(next).some(([id,value])=>old[id]!==value)?{...old,...next}:old);
  });return()=>{active=false;};
 },[photos]);
 const rows:UploadedPhoto[][]=[];let sum=0;
 for(const photo of photos){const ratio=ratios[photo.id]||1.5;if(!rows.length||sum>=2.5||rows.at(-1)!.length>=3){rows.push([]);sum=0;}rows.at(-1)!.push(photo);sum+=ratio;}
 return <div ref={gallery} className="photo-gallery">{rows.map((row,i)=><div className="photo-row" key={i}>{row.map(p=>{const ratio=ratios[p.id]||1.5;return <figure key={p.id} style={{flex:`${ratio} 1 0`,maxWidth:`${ratio*420}px`}}><img data-photo-id={p.id} src={p.src} alt={p.name} style={{aspectRatio:ratio}} onLoad={e=>{const img=e.currentTarget;const value=img.naturalWidth/img.naturalHeight;if(value&&ratios[p.id]!==value)setRatios(old=>({...old,[p.id]:value}));}}/><figcaption>{String(p.order).padStart(2,'0')} / A MOMENT TO KEEP</figcaption></figure>;})}</div>)}</div>;
}
