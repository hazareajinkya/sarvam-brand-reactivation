import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { attribute, baselineScore, generatedScore, language } = req.body
    return res.status(200).json({ saved: true, attribute, baselineScore, generatedScore, language })
  }
  if (req.method === 'GET') return res.status(200).json({ scores: [], message: 'Connect Supabase to persist.' })
  return res.status(405).json({ error: 'Method not allowed' })
}
