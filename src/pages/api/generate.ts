import type { NextApiRequest, NextApiResponse } from 'next'

const K = process.env.SARVAM_API_KEY || ''

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

async function callTTS(text, lang) {
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
    if (!r.ok) { const err = await r.text(); console.error('TTS err:', r.status, err.slice(0, 200)); return '' }
    const d = await r.json()
    console.log('TTS response keys:', Object.keys(d))
    if (d.audios?.[0]?.audio_content) return d.audios[0].audio_content
    if (d.audio_content) return d.audio_content
    return ''
  } catch (e) { console.error('TTS caught:', e); return '' }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { brandName, attributes, customerName, lastPurchase, offer, language } = req.body
  if (!brandName || !attributes || !customerName || !offer) return res.status(400).json({ error: 'Fill all fields' })

  try {
    const attrTxt = Array.isArray(attributes) ? attributes.join('\n') : String(attributes)
    const lang = language || 'hi-IN'

    const attrLines = 'Brand Personality Attributes:\n' + attrTxt
    const gp = 'You are ' + brandName + ', a D2C brand.\n' + attrLines + '\n\nWrite a short reactivation call script in HINDI for ' + customerName + '. Last purchase: ' + (lastPurchase || 'N/A') + '. Offer: ' + offer + '.\n\nRules:\n- Hindi (Devanagari)\n- Feel like the brand personality\n- Under 120 words\n- Script only'
    const bp = 'Translate to Hindi:\n\nHi ' + customerName + '! This is ' + brandName + '. We noticed you have not shopped. Special offer: ' + offer + '. Call us!'

    const [g, b] = await Promise.all([
      callSarvam([{ role: 'user', content: gp }], 800),
      callSarvam([{ role: 'user', content: bp }], 400),
    ])

    let gs = g.content, bs = b.content
    if (!gs && !bs) {
      gs = 'Namaste ' + customerName + '! Yeh ' + brandName + ' hai. Humne dekha ki apne kuch samay se nahi kharida. Hum apke li for ek vishesh offer laqye hain: ' + offer + '. Kripnya website par jayein. Aapka swagat hai!'
      bs = gs
    } else if (!gs) gs = bs
    else if (!bs) bs = gs
      
    const [ba, aa] = await Promise.all([callTTS(gs, lang), callTTS(bs, lang)])

    res.json({
      generated: { script: gs, audioBase64: ba, debug: g.debug },
      baseline: { script: bs, audioBase64: aa, debug: b.debug },
    })
  } catch (e) {
    res.status(500).json({ error: e.message || 'Server error' })
  }
}
