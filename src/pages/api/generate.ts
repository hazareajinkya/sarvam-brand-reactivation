import type { NextApiRequest, NextApiResponse } from 'next'

const K = process.env.SARVAM_API_KEY || ''
const EK = process.env.ELEVENLABS_API_KEY || ''

async function callSarvam(messages, maxTokens = 600) {
  if (!K) return { content: '', debug: { error: 'No API key configured' } }
  try {
    const ac = new AbortController()
    const t = setTimeout(() => ac.abort(), 30000)
    const r = await fetch('https://api.sarvam.ai/v1/chat/completions', {
      method: 'POST', signal: ac.signal,
      headers: { 'api-subscription-key': K, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'sarvam-30b', messages, max_tokens: maxTokens }),
    })
    clearTimeout(t)
    const text = await r.text()
    if (!r.ok) return { content: '', debug: { error: text.slice(0, 300), status: r.status } }
    const d = JSON.parse(text)
    const choice = d.choices?.[0]
    const msg = choice?.message
    return {
      content: msg?.content || '',
      debug: { finish: choice?.finish_reason, hasMsg: !!msg, role: msg?.role, len: (msg?.content || '').length }
    }
  } catch (e) {
    return { content: '', debug: { error: e.name === 'AbortError' ? 'TIMEOUT' : (e.message || '').slice(0, 200) } }
  }
}

async function callSarvamTTS(text, lang) {
  if (!text || !K) return ''
  try {
    const ac = new AbortController()
    const t = setTimeout(() => ac.abort(), 30000)
    const r = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST', signal: ac.signal,
      headers: { 'api-subscription-key': K, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'bulbul:v3', text, voice: 'meera', target_language_code: lang, audio_format: 'wav', sample_rate: 8000 }),
    })
    clearTimeout(t)
    if (!r.ok) { const err = await r.text(); console.error('Sarvam TTS err:', r.status); return '' }
    const d = await r.json()
    if (d.audios?.[0]?.audio_content) return d.audios[0].audio_content
    if (d.audio_content) return d.audio_content
    return ''
  } catch (e) { console.error('Sarvam TTS caught:', e); return '' }
}

async function callElevenTTS(text) {
  if (!text || !EK) return ''
  try {
    const r = await fetch('https://api.elevenlabs.io/v1/text-to-speech/RABOvaPec1ymXz02oDQi', {
      method: 'POST',
      headers: { 'xi-api-key': EK, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', output_format: 'mp3_44100_128' }),
    })
    if (!r.ok) { const err = await r.text(); console.error('Eleven err:', r.status); return '' }
    const buf = await r.arrayBuffer()
    return Buffer.from(buf).toString('base64')
  } catch (e) { console.error('Eleven caught:', e); return '' }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { brandName, attributes, customerName, lastPurchase, offer, language } = req.body
  if (!brandName || !attributes || !customerName || !offer) return res.status(400).json({ error: 'Fill all fields' })

  try {
    const attrTxt = Array.isArray(attributes) ? attributes.join('\\n') : String(attributes)
    const lang = language || 'hi-IN'

    const gp = 'You are ' + brandName + ', a D2C brand.\\n' + 'Brand Personality:\\n' + attrTxt + '\\n\\nWrite a short reactivation call script in HINDI for ' + customerName + '. Last purchase: ' + (lastPurchase || 'N/A') + '. Offer: ' + offer + '.\\nRules:\\n- Hindi (Devanagari script)\\n- Feel like the brand personality\\n- Under 120 words\\n- Script only, no labels'
    const bp = 'Translate to Hindi:\\n\\nHi ' + customerName + '! This is ' + brandName + '. We noticed you have not shopped with us for a while. Special offer: ' + offer + '. Call us today!'

    const [g, b] = await Promise.all([
      callSarvam([{ role: 'user', content: gp }], 800),
      callSarvam([{ role: 'user', content: bp }], 400),
    ])

    let gs = g.content, bs = b.content
    if (!gs && !bs) {
      gs = 'Namaste ' + customerName + '! Yeh ' + brandName + ' hai. Humne dekha ki apne kuch samay se nahi kharida. Hum apke li ek vishesh offer laye hain: ' + offer + '. Kripya website par jayein. Aapka swagat hai!'
      bs = gs
    } else if (!gs) gs = bs
    else if (!bs) bs = gs

    let ba = await callSarvamTTS(gs, lang)
    if (!ba) ba = await callElevenTTS(gs)
    let aa = await callSarvamTTS(bs, lang)
    if (!aa) aa = await callElevenTTS(bs)

    res.json({
      generated: { script: gs, audioBase64: aa, format: aa ? 'mp3' : 'none', debug: g.debug },
      baseline: { script: bs, audioBase64: ba, format: ba ? 'mp3' : 'none', debug: b.debug },
    })
  } catch (e) {
    res.status(500).json({ error: e.message || 'Server error' })
  }
}
