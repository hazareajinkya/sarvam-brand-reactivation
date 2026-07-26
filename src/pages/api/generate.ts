import type { NextApiRequest, NextApiResponse } from 'next'

const SARVAM_API_KEY = process.env.SARVAM_API_KEY || ''

async function callSarvam(messages: Array<{role: string, content: string}>, maxTokens: number = 600): Promise<string> {
  const r = await fetch('https://api.sarvam.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'api-subscription-key': SARVAM_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'sarvam-30b', messages, max_tokens: maxTokens }),
  })
  if (!r.ok) throw new Error('Sarvam API: ' + (await r.text()))
  const d = await r.json()
  return d.choices?.[0]?.message?.content || ''
}

async function callTTS(text: string, lang: string): Promise<string> {
  try {
    const r = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: { 'api-subscription-key': SARVAM_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'bulbul:v3', text, voice: 'meera', target_language_code: lang, audio_format: 'wav', sample_rate: 8000 }),
    })
    if (!r.ok) return ''
    const d = await r.json()
    return d.audios?.[0]?.audio_content || ''
  } catch { return '' }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { brandName, attributes, customerName, lastPurchase, offer, language } = req.body
  if (!brandName || !attributes || !customerName || !offer) {
    return res.status(400).json({ error: 'कृपया सभी फील्ड भरें' })
  }

  try {
    const attrText = Array.isArray(attributes) ? attributes.join('\n') : String(attributes)
    const lang = language || 'hi-IN'

    const attrLines = 'Brand Personality Attributes:\n' + attrText
    const genPrompt = 'You are ' + brandName + ', a D2C brand. ' + attrLines + '\n\nWrite a short reactivation call script in HINDI for ' + customerName + '. Last purchase: ' + (lastPurchase || 'N/A') + '. Offer: ' + offer + '.\n\nRules:\n- Write in Hindi (Devanagari). The brand has NEVER spoken Hindi before.\n- Every sentence must feel like the brand personality attributes above.\n- Do NOT translate from English. Write originally in Hindi.\n- Warm, not call-center tone.\n- Keep under 120 words.\n- Output the script only, nothing else.'

    const basePrompt = 'Translate this to Hindi exactly, nothing else:\n\n"Hi ' + customerName + '! This is ' + brandName + ' calling. We noticed you haven\'t shopped with us in a while. Here\'s a special offer: ' + offer + '. Call us or visit our website. Hope to see you soon!"'

    const [generatedScript, baselineScript] = await Promise.all([
      callSarvam([{ role: 'user', content: genPrompt }], 600),
      callSarvam([{ role: 'user', content: basePrompt }], 400),
    ])

    const [brandedAudio, baselineAudio] = await Promise.all([
      callTTS(generatedScript, lang),
      callTTS(baselineScript, lang),
    ])

    res.status(200).json({
      generated: { script: generatedScript, audioBase64: brandedAudio },
      baseline: { script: baselineScript, audioBase64: baselineAudio }
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Server error' })
  }
}
