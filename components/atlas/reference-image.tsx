'use client';
import {useState} from 'react';
export function ReferenceImage({src,name,caption='Reference image · TCGdex',large=false}:{src:string|null;name:string;caption?:string;large?:boolean}) {
  const [failed,setFailed]=useState(false);
  return <figure className="space-y-2"><div className={`flex items-center justify-center rounded-xl bg-white/5 ${large?'min-h-80 p-6':'h-52 p-3'}`}>{src&&!failed?<img src={src} alt={name} width={large?600:245} height={large?825:337} loading="lazy" decoding="async" className={large?'max-h-[32rem] w-auto max-w-full object-contain':'h-full w-auto max-w-full object-contain'} onError={()=>setFailed(true)}/>:<span className="text-sm text-white/50">Image unavailable</span>}</div><figcaption className="text-xs text-white/50">{caption}</figcaption></figure>;
}
