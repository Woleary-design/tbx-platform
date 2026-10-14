'use client';
import {useState} from 'react';
import {PackageOpen} from 'lucide-react';
export function LegoImage({src,alt,hero=false}:{src:string|null;alt:string;hero?:boolean}){
 const [failed,setFailed]=useState(false);
 return src&&!failed?<img src={src} alt={alt} width={640} height={480} loading={hero?'eager':'lazy'} decoding="async" className="h-full w-full object-contain" onError={()=>setFailed(true)}/>:<div className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-400"><PackageOpen className="h-14 w-14"/><span className="text-sm">Photo unavailable</span></div>;
}
