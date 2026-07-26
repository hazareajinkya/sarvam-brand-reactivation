import { State } from 'react'

export default function Home() {
  const [formData, setFormData] = State({
    brandName: '',
    attributes: '',
    customerName: '',
    lastPurchase: '',
    offer: '',
    language: 'hi-IN',
  })
  const [loading, setLoading] = State(false)
  const [result, setResult] = State(null)
  const [error, setError] = State('')

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Generation failed')
      }
      const data = await res.json()
      setResult(data)
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Brand Voice Reactivation</h1>
        <p className="text-center text-gray-600 mb-8">
          Make your brand sound like your brand — in a language it has never spoken
        </p>

        { error && <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-lg mb-4">{error}</div> }

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">1. Define Your Brand Personality</h2>
          <textarea
            className="w-full p-3 border border-gray-200 rounded-lg mb-3"
            rows={4}
            placeholder="Enter 3-5 brand personality attributes, one per line...\nex: 'uses short punchy sentences', 'calls the customer yaar', 'makes fun of competitors playfully'"
            value={formData.attributes}
            onChange={(e) => setFormData({ ...formData, attributes: e.target.value })}
          />
          <input
            className="w-full p-3 border border-gray-200 rounded-lg"
            placeholder="Brand name (e.g., Bombay Skin Co.)"
            value={formData.brandName}
            onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
          />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">2. Customer & Offer</h2>
          <input className="w-full p-3 border border-gray-200 rounded-lg mb-3" placeholder="Customer name" value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} />
          <input className="w-full p-3 border border-gray-200 rounded-lg mb-3" placeholder="Last purchase (e.g., Body Lotion, 4 months ago)" value={formData.lastPurchase} onChange={(e) => setFormData({ ...formData, lastPurchase: e.target.value })} />
          <input className="w-full p-3 border border-gray-200 rounded-lg" placeholder="Reactivation offer (e.g., 20% off + free shipping)" value={formData.offer} onChange={(e) => setFormData({ ...formData, offer: e.target.value })} />
        </div>

        <button
          className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Scripts'}
        </button>

        { result && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">3. A/B Comparison</h2>
            <p className="text-gray-500 text-sm mb-4">Machine-translated vs brand-aware generation. Listen below.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-medium text-red-600 mb-2">✔ Machine Translated (Baseline)</h3>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap mb-2">{result.baseline.script}</pre>
                <div className="mt-2 text-sm text-red-500"><strong>Attributes score: </strong>┍ </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <h3 className="font-medium text-green-600 mb-2">✅ Brand-Generated</h3>
                <pre className="text-xs text-green-700 whitespace-pre-wrap mb-2">{result.generated.script}</pre>
                <div className="mt-2 text-sm text-green-600"><strong>Attributes score: </strong>✅</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
