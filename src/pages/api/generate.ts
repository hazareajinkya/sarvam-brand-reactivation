import type { NextApiRequest, NextApiResponse } from 'next'

const SARVAM_API_KEY = process.env.SARVAM_API_KEY || ''

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { brandName, attributes, customerName, lastPurchase, offer, language } = req.body
  if (!brandName || !attributes || !customerName || !offer) return res.status(400).json({ error: 'Missing required fields' })

  try {
    const attrList = Array.isArray(attributes) ? attributes.join('\n') : attributes

    // Step 1: Generate personality-constrained script
    const genPrompt = `You are an expert copywriter for "${brandName}" — a D2C personal care brand.\n\nBrand Personality Attributes:\n${attrList}\n\nWrite a short reactivation call script in HINDI for ${customerName}. Last purchase: ${lastPurchase || 'N/A'}. Offer: ${offer}.\n\nRules:\n- Write in Hindi (Devanagari). The brand has NEVER spoken Hindi.\n- Every sentence must satisfy ALL personality attributes.\n- Do NOT translate English. Write originally in Hindi with brand voice.\n- Warm, not robotic. No call-center tone.\n- Under 120 words.`

    const genResp = await fetch('https://api.sarvam.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'api-subscription-key': SARVAM_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'sarvam-30b', messages: [{ role: 'user', content: genPrompt }], max_tokens: 500, reasoning_effort: null }),
    })
    if (!genResp.ok) return res.status(500).json({ error: 'Generation failed', detail: await genResp.text() })
    const genData = await genResp.json()
    const generatedScript = genData.choices?[0]?.message?.content || ''

    // Step 2: Generate baseline (neutral translation)
    const baselinePrompt= `Translate to Hindi exactly and only:\n\n\"Hi ${customerName}! This is ${brandName} calling. We noticed you haven't shopped in a while. Here's a special offer: ${offer}. Call us or visit our website. Hope to see you soon!\"\n\nProvide only the Hindi translation, nothing else.`
    const baseResp = await fetch('https://api.sarvam.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'api-subscription-key': SARVAM_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'sarvam-30b', messages: [{ role: 'user', content: baselinePrompt }], max_tokens: 300, reasoning_effort: null }),
    })
    const baseData = await baseResp.json()
    const baselineScript = baseData.choices?[0]?.message?.content || ''

    // Step 3: Generate TTS for both
    async function tts(text: string): Promise<string | null> {
      const r = await fetch('https://api.sarvam.ai/text-to-speech', {
        method: 'POST',
        headers: { 'api-subscription-key': SARVAM_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'bulbul:v3', text, voice: 'meera', target_language_code: language || 'hi-IN', audio_format: 'wav', sample_rate: 16000 }),
      })
      if (!r.ok) return null
      const d = await r.json()
      return d.audios?[0]?.audio_content || d.audio || null
    }

    const [brandedAudio, baselineAudio] = await Promise.all([tts(generatedScript), tts(baselineScript)])

    res.status(200).json({ generated: { script: generatedScript, audio: brandedAudio }, baseline: { script: baselineScript, audio: baselineAudio } })
  } catch (error) {
    console.error('Generate error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
