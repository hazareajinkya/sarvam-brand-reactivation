import React,{useState,useEffect,useRef,useCallback}from'react'
const sbw=(t,l='hi-IN')=>{if(typeof window==='undefined'||!('speechSynthesis'in window))return false
const u=new SpeechSynthesisUtterance(t);u.lang=l;u.rate=.95;u.pitch=1
const v=window.speechSynthesis.getVoices();const p=v.find(x=>x.lang?.startsWith('hi'))
if(p)u.voice=p;window.speechSynthesis.cancel();window.speechSynthesis.speak(u);return true}
export default function Home(){const[L,sL]=useState(0);const[R,sR]=useState(null);const[E,sE]=useState('')
const[SP,sSP]=useState(null);const AR=useRef(null)
const[F,sf]=useState({brandName:'Bombay Skin Co.',attributes:'Uses short punchy sentences\nCalls the customer "yaar"\nPlayful irreverent tone\nMakes fun of competitors\nSlightly mischievous attitude',customerName:'Suman',lastPurchase:'Bought Body Lotion 4 months ago',offer:'20% off + Free shipping',language:'hi-IN'})
useEffect(()=>{if('speechSynthesis'in window){window.speechSynthesis.getVoices();window.speechSynthesis.onvoiceschanged=()=>{window.speechSynthesis.getVoices()}}},[])
const hC=e=>sf({...F,[e.target.name]:e.target.value})
const hG=async()=>{sL(1);sE('');sR(null);try{const r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(F)});const d=await r.json();if(!r.ok)throw Error(d.error||'err');sR(d)}catch(e){sE(e.message)}finally{sL(0)}}
const pA=useCallback((s,b64,t)=>{if(SP===t){window.speechSynthesis?.cancel();sSP(null);return}
window.speechSynthesis?.cancel()
if(b64&&AR.current){AR.current.src='data:audio/wav;base64,'+b64;AR.current.play().catch(()=>{});sSP(t);return}
if(s){const ok=sbw(s);if(ok){sSP(t);const ci=setInterval(()=>{if(!window.speechSynthesis.speaking){clearInterval(ci);sSP(null)}},200)}}},[SP])
const AL=F.attributes.split('\n').filter(a=>a.trim())
const Btn=({s,b,t})=>{const iS=SP===t;const hB=!!b;const hS=!!s;const fb=hS&&!hB
if(!hS&&!hB)return React.createElement('div',{className:'h-10 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400'},'No script')
const btnCls='h-10 w-full rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all '+(iS?'bg-orange-500 text-white':'bg-gradient-to-r from-orange-400 to-rose-400 text-white hover:shadow-md')
const fbCls='h-10 w-full rounded-lg flex items-center justify-center gap-2 text-sm font-medium border transition-all mt-2 '+(iS?'bg-orange-100 border-orange-300 text-orange-700':'bg-white border-gray-300 text-gray-600 hover:bg-gray-50')
return React.createElement('div',null,
hS?React.createElement('button',{onClick:()=>pA(s,b,t),className:btnCls},iS?'Stop':'Play Audio (Sarvam)'):null,
fb?React.createElement('button',{onClick:()=>pA(s,b,t),className:fbCls},iS?'Stop':'Listen (Device Voice)',React.createElement('span',{className:'text-xs opacity-60'},'(Hindi)')):null)}
const hd=React.createElement('div',{className:'text-center mb-8'},
  React.createElement('h1',{className:'text-5xl font-black tracking-tight'},
    React.createElement('span',{className:'bg-gradient-to-r from-orange-500 to-rose-600 bg-clip-text text-transparent'},'Brand Voice Reactivation')),
  React.createElement('p',{className:'text-gray-500 mt-2 text-lg'},'Make your brand sound like your brand -- in a language it has never spoken before'))
const leftCol=React.createElement('div',{className:'lg:col-span-2 space-y-4'},
  React.createElement('div',{className:'bg-white rounded-2xl shadow-sm border border-gray-100 p-6'},
    React.createElement('h2',{className:'font-bold text-lg mb-1'},'1. Brand Personality'),
    React.createElement('p',{className:'text-sm text-gray-400 mb-3'},'Define 3-5 testable attributes (not adjectives)'),
    React.createElement('textarea',{name:'attributes',value:F.attributes,onChange:hC,className:'w-full p-3 border border-gray-200 rounded-xl text-sm font-mono',rows:5}),
    React.createElement('input',{name:'brandName',value:F.brandName,onChange:hC,className:'w-full p-3 border border-gray-200 rounded-xl mt-3',placeholder:'Brand name'})),
  React.createElement('div',{className:'bg-white rounded-2xl shadow-sm border border-gray-100 p-6'},
    React.createElement('h2',{className:'font-bold text-lg mb-3'},'2. Customer & Offer'),
    React.createElement('div',{className:'grid grid-cols-2 gap-3'},
      React.createElement('input',{name:'customerName',value:F.customerName,onChange:hC,className:'p-3 border border-gray-200 rounded-xl',placeholder:'Customer name'}),
      React.createElement('select',{name:'language',value:F.language,onChange:hC,className:'p-3 border border-gray-200 rounded-xl bg-white'},
        React.createElement('option',{value:'hi-IN'},'Hindi'),
        React.createElement('option',{value:'mr-IN'},'Marathi'))),
    React.createElement('input',{name:'lastPurchase',value:F.lastPurchase,onChange:hC,className:'w-full p-3 border border-gray-200 rounded-xl mt-3',placeholder:'Last purchase'}),
    React.createElement('input',{name:'offer',value:F.offer,onChange:hC,className:'w-full p-3 border border-gray-200 rounded-xl mt-3',placeholder:'Offer'})),
  React.createElement('button',{onClick:hG,disabled:!!L,className:'w-full py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-lg rounded-xl hover:shadow-lg transition-all disabled:opacity-50'},L?'Generating...':'Generate Scripts'),
  E?React.createElement('div',{className:'bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl'},E):null)
const rightCol=React.createElement('div',{className:'space-y-4'},
  React.createElement('div',{className:'bg-white rounded-2xl shadow-sm border border-gray-100 p-4'},
    React.createElement('h3',{className:'font-semibold text-sm text-gray-700 mb-2'},'Attributes'),
    AL.map((a,i)=>React.createElement('div',{key:i,className:'text-xs py-1.5 px-2 mb-1 bg-gray-50 rounded-lg text-gray-600'},a))),
  React.createElement('div',{className:'bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-100'},
    React.createElement('h3',{className:'font-semibold text-sm text-purple-800'},'How this works'),
    React.createElement('p',{className:'text-xs text-purple-600 mt-1'},'Sarvam-30B generates the script in Hindi. Your browser reads it aloud when Sarvam audio is unavailable.')))
const abComparison=R?React.createElement('div',{className:'bg-white rounded-2xl shadow-lg border-2 border-orange-100 p-6 mt-6'},
  React.createElement('div',{className:'flex items-center justify-between mb-4'},
    React.createElement('h2',{className:'text-xl font-bold'},'A/B Comparison'),
    React.createElement('span',{className:'text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full'},'Language: '+(F.language==='hi-IN'?'Hindi':'Marathi'))),
  React.createElement('div',{className:'grid grid-cols-1 md:grid-cols-2 gap-6'},
    React.createElement('div',{className:'bg-gray-50 rounded-xl p-4 border-2 border-gray-200'},
      React.createElement('div',{className:'flex items-center gap-2 mb-3'},
        React.createElement('div',{className:'w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold'},'B'),
        React.createElement('div',null,
          React.createElement('h3',{className:'font-bold text-sm'},'Baseline (Machine Translated)'),
          React.createElement('p',{className:'text-xs text-gray-400'},'Neutral translation of English script'))),
      React.createElement(Btn,{s:R.baseline?.script,b:R.baseline?.audioBase64,t:'baseline'}),
      React.createElement('pre',{className:'text-xs mt-2 text-gray-500 whitespace-pre-wrap bg-gray-100 p-2 rounded-lg max-h-32 overflow-y-auto'},R.baseline?.script||'No script')),
    React.createElement('div',{className:'bg-green-50 rounded-xl p-4 border-2 border-green-300'},
      React.createElement('div',{className:'flex items-center gap-2 mb-3'},
        React.createElement('div',{className:'w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold'},'A'),
        React.createElement('div',null,
          React.createElement('h3',{className:'font-bold text-sm'},'Brand Generated'),
          React.createElement('p',{className:'text-xs text-green-600'},'Sarvam-30B personality-constrained'))),
      React.createElement(Btn,{s:R.generated?.script,b:R.generated?.audioBase64,t:'generated'}),
      React.createElement('pre',{className:'text-xs mt-2 text-green-700 whitespace-pre-wrap bg-green-100 p-2 rounded-lg max-h-32 overflow-y-auto'},R.generated?.script||'No script'))))):null
return React.createElement('div',{className:'min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-4 md:p-8'},
  React.createElement('audio',{ref:AR,className:'hidden'}),
  React.createElement('main',{className:'max-w-6xl mx-auto'},hd,
    React.createElement('div',{className:'grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'},leftCol,rightCol),
  abComparison))}