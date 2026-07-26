import { useState } from 'react'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [scoreVisible, setScoreVisible] = useState(false)
  const [scores, setScores] = useState({})
  const [form, setForm] = useState({
    brandName: 'Bombay Skin Co.',
    attributes: 'Uses short punchy sentences\nCalls the customer "yaar"\nPlayful irreverent tone\nMakes fun of competitors\nSlightly mischievous attitude',
    customerName: 'Suman',
    lastPurchase: 'Bought Body Lotion 4 months ago',
    offer: '20% off + Free shipping',
    language: 'hi-IN'
  })

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value})

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    setScoreVisible(false)
    setScores({})
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleScore = (attr, type, v) => {
    const val = parseInt(v)
    setScores(prev => ({...prev, [attr]: {...(prev[attr] || {}), [type]: val}}))
  }

  const attrList = form.attributes.split('\n').filter(a => a.trim())

  const getSrc = (b64) => {
    if (!b64) return ''
    return 'data:audio/wav;base64,' + b64
  }

  const calcTotal = (type) => {
    let total = 0
    for (const key of Object.keys(scores)) {
      if (scores[key] && scores[key][type]) total += scores[key][type]
      else total += 1
    }
    return total
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-4 md:p-8">
      <main className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-orange-500 to-rose-600 bg-clip-text text-transparent">
              Brand Voice Reactivation
            </span>
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Make your brand sound like your brand — in a language it has never spoken before
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-lg mb-1">1. Brand Personality</h2>
              <p className="text-sm text-gray-400 mb-3">Define 3-5 testable attributes (not adjectives)</p>
              <textarea name="attributes" value={form.attributes} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl text-sm font-mono" rows={5} />
              <input name="brandName" value={form.brandName} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl mt-3" placeholder="Brand name" />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-lg mb-3">2. Customer & Offer</h2>
              <div className="grid grid-cols-2 gap-3">
                <input name="customerName" value={form.customerName} onChange={handleChange} className="p-3 border border-gray-200 rounded-xl" placeholder="Customer name" />
                <select name="language" value={form.language} onChange={handleChange} className="p-3 border border-gray-200 rounded-xl bg-white">
                  <option value="hi-IN">Hindi</option>
                  <option value="mr-IN">Marathi</option>
                </select>
              </div>
              <input name="lastPurchase" value={form.lastPurchase} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl mt-3" placeholder="Last purchase" />
              <input name="offer" value={form.offer} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl mt-3" placeholder="Reactivation offer" />
            </div>

            <button onClick={handleGenerate} disabled={loading} className="w-full py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-lg rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? 'Generating...' : 'Generate Scripts'}
            </button>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">{error}</div>}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Attributes</h3>
              {attrList.map((a, i) => (
                <div key={i} className="text-xs py-1.5 px-2 mb-1 bg-gray-50 rounded-lg text-gray-600">
                  {a}
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-100">
              <h3 className="font-semibold text-sm text-purple-800">How this works</h3>
              <p className="text-xs text-purple-600 mt-1">Sarvam-30B generates the script in Hindi constrained by your attributes. The baseline is a neutral machine translation. A native speaker scores both.</p>
            </div>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">A/B Comparison</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                Language: {form.language === 'hi-IN' ? 'Hindi' : 'Marathi'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">B</div>
                  <div>
                    <h3 className="font-bold text-sm">Baseline (Machine Translated)</h3>
                    <p className="text-xs text-gray-400">Neutral translation of English script</p>
                  </div>
                </div>
                {result.baseline?.audioBase64 ? (
                  <audio controls src={getSrc(result.baseline.audioBase64)} className="w-full h-10" />
                ) : (
                  <div className="h-10 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400">Audio unavailable</div>
                )}
                <pre className="text-xs mt-2 text-gray-500 whitespace-pre-wrap bg-gray-100 p-2 rounded-lg max-h-32 overflow-y-auto">
                  {result.baseline?.script || 'No script'}
                </pre>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border-2 border-green-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">A</div>
                  <div>
                    <h3 className="font-bold text-sm">Brand Generated</h3>
                    <p className="text-xs text-green-600">Sarvam-30B personality-constrained</p>
                  </div>
                </div>
                {result.generated?.audioBase64 ? (
                  <audio controls src={getSrc(result.generated.audioBase64)} className="w-full h-10" />
                ) : (
                  <div className="h-10 bg-green-100 rounded-lg flex items-center justify-center text-xs text-green-500">Audio unavailable</div>
                )}
                <pre className="text-xs mt-2 text-green-700 whitespace-pre-wrap bg-green-100 p-2 rounded-lg max-h-32 overflow-y-auto">
                  {result.generated?.script || 'No script'}
                </pre>
              </div>
            </div>

            <button onClick={() => setScoreVisible(!scoreVisible)} className="mt-4 text-sm text-orange-600 hover:text-orange-800 font-medium">
              {scoreVisible ? 'Hide Scoring' : '+ Score Attributes'}
            </button>

            {scoreVisible && (
              <div className="mt-4 bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-sm mb-3">Score each attribute (1-5)</h4>
                {attrList.map((attr, i) => {
                  const attrKey = attr.toLowerCase().replace(/\s+/g, '-')
                  const s = scores[attrKey] || {}
                  return (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center mb-2 bg-white p-3 rounded-lg text-sm">
                      <span className="font-medium text-xs text-gray-600">{attr}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-600 w-16">Baseline:</span>
                        <input type="range" min="1" max="5" value={s.baseline || 1} onChange={e => handleScore(attrKey, 'baseline', e.target.value)} className="flex-1" />
                        <span className="text-xs w-4">{s.baseline || 1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-green-600 w-16">Generated:</span>
                        <input type="range" min="1" max="5" value={s.generated || 1} onChange={e => handleScore(attrKey, 'generated', e.target.value)} className="flex-1" />
                        <span className="text-xs w-4">{s.generated || 1}</span>
                      </div>
                    </div>
                  )
                })}
                <div className="mt-3 text-xs text-gray-400">
                  Total baseline: {calcTotal('baseline')} / {attrList.length * 5} |
                  Generated: {calcTotal('generated')} / {attrList.length * 5}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-8 text-xs text-gray-300">
          Built for Sarvam Epoch Buildathon | Sarvam-30B + Bulbul TTS
        </div>
      </main>
    </div>
  )
}
