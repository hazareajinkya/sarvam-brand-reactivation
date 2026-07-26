import type { NextApiRequest, NextApiResponse } from 'next'

const SARVAM_API_KEY = process.env.SARVAM_API_KEY || ''
const API_BASE = 'https://api.sarvam.ai'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { brandName, attributes, customerName, lastPurchase, offer, language } = req.body
  if (!brandName || !attributes || !customerName || !offer) {
    return res.status(400).json({ error: 'Please fill all fields' })
  }

  try {
    const attrList = Array.isArray(attributes) ? attributes.join('\\n') : attributes
    const lang = language || 'hi-IN'

    const genPrompt = 'You are an expert copywriter for \"' + brandName + '\" - a D2C personal care brand.\n\nBrand Personality Attributes:\n' + attrList + '\n\nWrite a short reactivation call script in HINDI for ' + customerName + '.\nLast purchase: ' + (lastPurchase || 'N/A') + '\nOffer: ' + offer + '\n\nRules:\n- Write in Hindi (Devanagari script). The brand has NEVER spoken Hindi.\n- Every sentence must satisfy ALL personality attributes.\n- Do NOT translate English. Write originally in Hindi with brand voice.\n- Warm, not robotic. No call-center tone.\n- Under 120 words.\n- Output only the script, no extra text.'

    const genResp = await fetch(API_BASE + '/v1/chat/completions', {
      method: 'POST',
      headers: { 'api-subscription-key': SARVAM_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'sarvam-30b', messages: [{ role: 'user', content: genPrompt }], max_tokens: 600, reasoning_effort: null }),
    })

    if (!genResp.ok) return res.status(500).json({ error: 'Sarvam API error', detail: await genResp.text() })

    const genData = await genResp.json()
    const generatedScript = genData.choices?.[0]?.message?.content || ''

    const baselinePrompt = 'Translate to Hindi exactly. Only the translation, nothing else:\n\n\"Hi ' + customerName + '! This is ' + brandName + ' calling. We noticed you have not shopped with us in a while. Here is a special offer just for you: ' + offer + '. Call us or visit our website today. Hope to see you soon!\"'

    const baseResp = await fetch(API_BASE + '/v1/chat/completions', {
      method: 'POST',
      headers: { 'api-subscription-key': SARVAM_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'sarvam-30b', messages: [{ role: 'user', content: baselinePrompt }], max_tokens: 400, reasoning_effort: null }),
    })
    const baseData = await baseResp.json()
    const baselineScript = baseData.choices?.[0]?.message?.content || ''

    async function tts(text: string): Promise<string> {
      try {
        const r = await fetch(API_BASE + '/text-to-speech', {
          method: 'POST',
          headers: { 'api-subscription-key': SARVAM_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'bulbul:v3', text, voice: 'meera', target_language_code: lang, audio_format: 'wav', sample_rate: 8000 }),
        })
        if (!r.ok) return ''
        const d = await r.json()
        return d.audios?.[0]?.audio_content || ''
      } catch { return '' }
    }

    const [brandedAudio, baselineAudio] = await Promise.all([tts(generatedScript), tts(baselineScript)])

    res.status(200).json({
      generated: { script: generatedScript, audioBase64: brandedAudio },
      baseline: { script: baselineScript, audioBase64: baselineAudio }
    })
  } catch (error) {
    res.status(500).json({ error: 'Server error', detail: String(error) })
  }
}
