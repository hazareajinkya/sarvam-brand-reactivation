import type { NextApiRequest, NextApiResponse } from 'next'

const SARVAM_API_KEY = process.env.SARVAM_API_KEY || ''
const API_BASE = 'https://api.sarvam.ai'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { brandName, attributes, customerName, lastPurchase, offer, language } = req.body
  if (!brandName || !attributes || !customerName || !offer) {
    return res.status(400).json({ error: 'कृपया सभी फील्ड भरें' })
  }

  try {
    const attrList = Array.isArray(attributes) ? attributes.join('\\n') : attributes
    const lang = language || 'hi-IN'

    // Step 1: Generate personality-constrained script
    const genPrompt = `आप "${brandName}" के लिए एक एक्सपर्ट कॉपीराइटर हैं — यह एक D2C पर्सनल केयर ब्रांड है।

ब्रांड की पर्सनैलिटी:
${attrList}

${customerName} के लिए एक छोटा रिएक्टिवेशन कॉल स्क्रिप्ट हिंदी में लिखें।
आखिरी खरीदारी: ${lastPurchase || 'N/A'}
ऑफर: ${offer}

नियम:
- पूरी तरह हिंदी में लिखें (देवनागरी लिपि)
- हर वाक्य ब्रांड की पर्सनैलिटी के मुताबिक हो
- अंग्रेज़ी से अनुवाद न करें — सीधे हिंदी में ब्रांड वॉइस में लिखें
- कॉल सेंटर जैसा न लगे — गर्मजोशी और असली अंदाज़
- १२० शब्दों से कम
- सिर्फ स्क्रिप्ट लिखें, कोई एक्स्ट्रा टेक्स्ट नहीं`

    const genResp = await fetch(${API_BASE}/v1/chat/completions, {
      method: 'POST',
      headers: { 'api-subscription-key': SARVAM_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'sarvam-30b',
        messages: [{ role: 'user', content: genPrompt }],
        max_tokens: 600,
        reasoning_effort: null
      }),
    })

    if (!genResp.ok) {
      const errText = await genResp.text()
      return res.status(500).json({ error: 'सर्वम एपीआई त्रुटि', detail: errText })
    }

    const genData = await genResp.json()
    const generatedScript = genData.choices?.[0]?.message?.content || ''

    // Step 2: Generate baseline (neutral machine translation)
    const baselinePrompt = `नीचे दिए गए अंग्रेज़ी टेक्स्ट का हिंदी में अनुवाद करें। सिर्फ अनुवाद दें, कुछ और नहीं:

"Hi ${customerName}! This is ${brandName} calling. We noticed you haven't shopped with us in a while. Here's a special offer just for you: ${offer}. Call us or visit our website today. Hope to see you soon!"`

    const baseResp = await fetch(${API_BASE}/v1/chat/completions, {
      method: 'POST',
      headers: { 'api-subscription-key': SARVAM_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'sarvam-30b',
        messages: [{ role: 'user', content: baselinePrompt }],
        max_tokens: 400,
        reasoning_effort: null
      }),
    })

    const baseData = await baseResp.json()
    const baselineScript = baseData.choices?.[0]?.message?.content || ''

    // Step 3: Generate TTS audio for both
    async function tts(text: string): Promise<string> {
      try {
        const r = await fetch(${API_BASE}/text-to-speech, {
          method: 'POST',
          headers: { 'api-subscription-key': SARVAM_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'bulbul:v3',
            text,
            voice: 'meera',
            target_language_code: lang,
            audio_format: 'wav',
            sample_rate: 8000
          }),
        })
        if (!r.ok) return ''
        const d = await r.json()
        return d.audios?.[0]?.audio_content || ''
      } catch { return '' }
    }

    const [brandedAudio, baselineAudio] = await Promise.all([
      tts(generatedScript),
      tts(baselineScript)
    ])

    res.status(200).json({
      generated: { script: generatedScript, audioBase64: brandedAudio },
      baseline: { script: baselineScript, audioBase64: baselineAudio }
    })

  } catch (error) {
    console.error('Generate error:', error)
    res.status(500).json({ error: 'सर्वर में समस्या आई', detail: String(error) })
  }
}
