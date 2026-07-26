import type { NextApiRequest, NextApiResponse } from 'next'
const K = process.env.SARVAM_API_KEY || ''
async function callSarvam(m, max=600) {
  if (!K) return {c:'',d:{e:'no key'}}
  try {
    const ac = new AbortController()
    setTimeout(() => ac.abort(), 55000)
    const r = await fetch('https://api.sarvam.ai/v1/chat/completions', {method:'POST',signal:ac.signal,headers:{'api-subscription-key':K,'Content-Type':'application/json'},body:JSON.stringify({model:'sarvam-30b',messages:m,max_tokens:max})})
    const t = await r.text()
    if(!r.ok) return {c:'',d:{e:t,s:r.status}}
    const j = JSON.parse(t)
    return {c:j.choices?.[0]?.message?.content||'',d:{f:j.choices?.[0]?.finish_reason}}
  } catch(e:any) { return {c:'',d:{e:e.name==='AbortError'?'TIMEOUT':String(e).slice(0,200)}} }
}
async function callTTS(txt,lang) {
  if(!txt||!K) return ''
  try{
    const ac=new AbortController()
    setTimeout(()=>ac.abort(),55000)
    const r=await fetch('https://api.sarvam.ai/text-to-speech',{method:'POST',signal:ac.signal,headers:{'api-subscription-key':K,'Content-Type':'application/json'},body:JSON.stringify({model:'bulbul:v3',text:txt,voice:'meera',target_language_code:lang,audio_format:'wav',sample_rate:8000})})
    if(!r.ok)return''
    const d=await r.json()
    return d.audios?.[0]?.audio_content||''
  }catch{return''}
}
export default async function h(req,res) {
  if(req.method!=='POST')return res.status(405).json({e:'nope'})
  const{brandName,attributes,customerName,lastPurchase,offer,language}=req.body
  if(!brandName||!attributes||!customerName||!offer)return res.status(400).json({e:'fill all'})
  try{
    const a=Array.isArray(attributes)?attributes.join('\n'):String(attributes)
    const lang=language||'hi-IN'
    const gp='You are '+brandName+', a D2C brand. Brand Personality Attributes:\n'+a+'\n\nWrite a short reactivation call script in HINDI for '+customerName+'. Last purchase: '+(lastPurchase||'N/A')+'. Offer: '+offer+'.\n\nRules:\n- Write in Hindi (Devanagari).\n- Every sentence must feel like the brand personality attributes above.\n- Do NOT translate from English.\n- Keep under 120 words.\n- Output the script only, nothing else.'
    const bp='Translate this to Hindi exactly, nothing else:\n\nHi '+customerName+'! This is '+brandName+' calling. We noticed you have not shopped with us in a while. Here is a special offer: '+offer+'. Call us or visit our website. Hope to see you soon!'
    const[g,b]=await Promise.all([callSarvam([{role:'user',content:gp}],600),callSarvam([{role:'user',content:bp}],400)])
    let gs=g.c,bs=b.c
    if(!gs&&!bs){const demo='Namaste '+customerName+'! Yeh '+brandName+' hai. Humne dekha ki aapne kuch samay se humse khareedari nahi ki hai. Hum aapke liye ek vishesh offer laaye hain: '+offer+'. Kripya humari website par jayein ya humein call karein. Aapka swagat hai!';gs=demo;bs=demo}
    else if(!gs)gs=bs;else if(!bs)bs=gs
    const[ba,aa]=await Promise.all([callTTS(gs,lang),callTTS(bs,lang)])
    res.json({generated:{script:gs,audioBase64:ba,debug:g.d},baseline:{script:bs,audioBase64:aa,debug:b.d}})
  }catch(e){res.status(500).json({e:e.message})}
}