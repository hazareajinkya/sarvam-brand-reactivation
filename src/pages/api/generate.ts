import type { NextApiRequest, NextApiResponse } from 'next'

const K = process.env.SARVAM_API_KEY || ''

async function callSarvam(messages: any[], maxTokens = 300) {
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
      content: choice?.message?.content?.trim() || '',
      debug: { finish: choice?.finish_reason, empty: !choice?.message?.content }
    }
  } catch (e: any) {
    return { content: '', debug: { error: e.message?.slice(0, 200) } }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'nope' })
  const { brandName, attributes, customerName, lastPurchase, offer, language } = req.body
  if (!brandName || !attributes || !customerName || !offer) return res.status(400).json({ error: 'fill all' })

  try {
    const attrTxt = Array.isArray(attributes) ? attributes.join('\n') : String(attributes)
    const lang = language || 'hi-IN'

    const gp = `Write a 2-3 sentence reactivation call script in Hindi (Devanagari) for ${customerName} from ${brandName}.

Brand voice:
${attrTxt}

Context: Last purchase was ${lastPurchase || 'N/A'}. Offer: ${offer}.

Rules: Hindi only, Devanagari script, 2-3 sentences, natural conversational tone, no labels.`

    const bp = `Translate this to Hindi (Devanagari script, natural tone, 2 sentences):
"Hi ${customerName}! This is ${brandName}. We noticed you haven't shopped with us in a while. Special offer: ${offer}."`

    const [g, b] = await Promise.all([
      callSarvam([{ role: 'user', content: gp }], 300),
      callSarvam([{ role: 'user', content: bp }], 200),
    ])

    let gs = g.content
    let bs = b.content

    if (!gs && !bs) {
      gs = `\u0928\u092e\u0938\u094d\u0924\u0947 ${customerName}! \u092f\u0939 ${brandName} \u0939\u0948\u0964 \u0939\u092e\u0928\u0947 \u0926\u0947\u0916\u093e \u0915\u093f \u0906\u092a\u0928\u0947 \u0915\u0941\u091b \u0938\u092e\u092f \u0938\u0947 \u0939\u092e\u0938\u0947 \u0916\u0930\u0940\u0926\u093e\u0930\u0940 \u0928\u0939\u0940\u0902 \u0915\u0940 \u0939\u0948\u0964 \u0939\u092e \u0906\u092a\u0915\u0947 \u0932\u093f\u090f \u090f\u0915 \u0935\u093f\u0936\u0947\u0937 \u0911\u092b\u0930 \u0932\u093e\u090f \u0939\u0948\u0902: ${offer}\u0964 \u0906\u091c \u0939\u0940 \u0939\u092e\u0947\u0902 \u0915\u093e\u0932 \u0915\u0930\u0947\u0902!`
      bs = gs
    } else if (!gs) gs = bs
    else if (!bs) bs = gs

    res.json({
      generated: { script: gs, audioBase64: '', format: 'none', debug: g.debug },
      baseline: { script: bs, audioBase64: '', format: 'none', debug: b.debug },
    })
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Server error' })
  }
}
