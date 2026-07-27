import{useRef,useState,useCallback}from'react'
const sbw=(t,l='hi-IN')=>{if(typeof window==='undefined'||!('speechSynthesis'in window))return
const u=new SpeechSynthesisUtterance(t);u.lang=l;u.rate=.95;u.pitch=1
const v=window.speechSynthesis.getVoices();const p=v.find(x=>x.lang?.startsWith('hi'))
if(p)u.voice=p;window.speechSynthesis.cancel();window.speechSynthesis.speak(u)}
export function useAudio(){const AR=useRef(null);const[SP,sSP]=useState(null)
const pA=useCallback((s,b64,t)=>{if(SP===t){window.speechSynthesis?.cancel();sSP(null);return}
window.speechSynthesis?.cancel()
if(b64&&AR.current){AR.current.src='data:audio/wav;base64,'+b64;AR.current.play().catch(()=>{});sSP(t);return}
if(s){sbw(s);sSP(t);const ci=setInterval(()=>{if(!window.speechSynthesis.speaking){clearInterval(ci);sSP(null)}},200)}},[SP])
return{AR,SP,pA}}