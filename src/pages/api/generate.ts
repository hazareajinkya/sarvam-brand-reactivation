import type { NextApiRequest, NextApiResponse } from 'next'

const K = process.env.SARVAM_API_KEY || ''
const EK = process.env.ELEVENLABS_API_KEY || ''

async function callSarvam(messages: any[], maxTokens = 600) {
  if (!K) return { content: '', debug: { error: 'No Sarvam API key' } }
  try {
    const r = await fetch('https://api.sarvam.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'api-subscription-key': K, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'sarvam-30b', messages, max_tokens: maxTokens }),
    })
    const text = await r.text()
    if (!r.ok) return { content: '', debug: { error: text.slice(0, 300), status: r.status } }
    const d = JSON.parse(text)
    const choice = d.choices?.[0]
    return {
      content: choice?.message?.content || '',
      debug: { finish: choice?.finish_reason, empty: !choice?.message?.content }
    }
  } catch (e: any) {
    return { content: '', debug: { error: e.message?.slice(0, 200) } }
  }
}

async function callSarvamTTS(text: string, lang: string): Promise<string> {
  if (!text || !K) return ''
  try {
    const r = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: { 'api-subscription-key': K, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'bulbul:v3', text, voice: 'meera', target_language_code: lang, audio_format: 'wav', sample_rate: 8000 }),
    })
    if (!r.ok) return ''
    const d = await r.json()
    return d.audios?.[0]?.audio_content || d.audio_content || ''
  } catch { return '' }
}

async function callElevenTTS(text: string): Promise<string> {
  if (!text || !EK) return ''
  try {
    const r = await fetch('https://api.elevenlabs.io/v1/text-to-speech/RABOvaPec1ymXz02oDQi', {
      method: 'POST',
      headers: { 'xi-api-key': EK, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', output_format: 'mp3_44100_128' }),
    })
    if (!r.ok) return ''
    const buf = await r.arrayBuffer()
    return Buffer.from(buf).toString('base64')
  } catch { return '' }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'nope' })
  const { brandName, attributes, customerName, lastPurchase, offer, language } = req.body
  if (!brandName || !attributes || !customerName || !offer) return res.status(400).json({ error: 'fill all' })

  try {
    const attrTxt = Array.isArray(attributes) ? attributes.join('\n') : String(attributes)
    const lang = language || 'hi-IN'

    const gp = `You are ${brandName}, a D2C brand.\nBrand Personality:\n${attrTxt}\n\nWrite a short reactivation call script in HINDI (Devanagari script) for ${customerName}. Last purchase: ${lastPurchase || 'N/A'}. Offer: ${offer}.\n\nRules:\n- Hindi in Devanagari\n- Feel like the brand personality\n- Under 120 words\n- Script only, no labels`

    const bp = `Translate to Hindi (script only):\n\nHi ${customerName}! This is ${brandName}. We noticed you haven't shopped with us for a while. Special offer: ${offer}. Call us today!`

    const [g, b] = await Promise.all([
      callSarvam([{ role: 'user', content: gp }], 800),
      callSarvam([{ role: 'user', content: bp }], 400),
    ])

    let gs = g.content, bs = b.content
    if (!gs && !bs) {
      gs = `नमस्ते ${customerName}! यह ${brandName} है. हमने देखा कि आपने कुछ समय से हमसे खरीदारी नहीं की है. हम आपके लिए एक विशेष ऑफर लाए हैं: ${offer}. कृपया हमारी वेबसाइट पर जाएं और इस ऑफर का लाभ उठाएं! आपका स्वागत है!`
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
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Server error' })
  }
}
