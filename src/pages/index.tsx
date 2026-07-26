import { useState } from 'react'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [scores, setScores] = useState({})
  const [form, setForm] = useState({
    brandName: 'बॉम्बे स्किन कंपनी',
    attributes: 'छोटे और पंची वाक्य बोलता है\nग्राहक को "यार" कहता है\nमजाकिया और बेबाक अंदाज\nप्रतियोगियों को मजाक में लेता है\nथोड़ा शरारती लहजा',
    customerName: 'सुमन',
    lastPurchase: '4 महीने पहले बॉडी लोशन खरीदा',
    offer: '20% छूट + फ्री शिपिंग',
    language: 'hi-IN'
  })

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value})

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    setScores({})
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'कुछ गड़बड़ हो गई')
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleScore = (attr, type, v) => {
    setScores(prev => ({...prev, [attr]: {...(prev[attr] || {}), [type]: parseInt(v)}}))
  }

  const attrList = form.attributes.split('\n').filter(a => a.trim())

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-100 p-4 md:p-8">
      <main className="max-w-5xl mx-auto space-y-4">
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
            🗣️ ब्रांड वॉयस रिएक्टिवेशन
          </h1>
          <p className="text-gray-600 mt-1 text-lg">अपने ब्रांड की पर्सनैलिटी को हिंदी में ज़िंदा रखें</p>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 border border-orange-200">
          <h2 className="text-xl font-bold text-gray-800 mb-1">१. ब्रांड पर्सनैलिटी</h2>
          <p className="text-sm text-gray-500 mb-3">अपने ब्रांड के ३-५ गुण लिखें</p>
          <input name="brandName" value={form.brandName} onChange={handleChange} placeholder="ब्रांड का नाम" className="w-full p-3 border border-gray-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400" />
          <textarea name="attributes" value={form.attributes} onChange={handleChange} rows={4} className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>

        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 border border-orange-200">
          <h2 className="text-xl font-bold text-gray-800 mb-1">२. ग्राहक और ऑफर</h2>
          <div className="grid md:grid-cols-3 gap-3">
            <input name="customerName" value={form.customerName} onChange={handleChange} placeholder="ग्राहक" className="p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <input name="lastPurchase" value={form.lastPurchase} onChange={handleChange} placeholder="आखिरी खरीद" className="p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <input name="offer" value={form.offer} onChange={handleChange} placeholder="ऑफर" className="p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
        </div>

        <button onClick={handleGenerate} disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg disabled:opacity-50">
          {loading ? '⏳ बना रहे हैं...' : '🎯 ब्रांड स्क्रिप्ट जनरेट करें'}
        </button>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">{error}</div>}

        {result && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 text-center">३. A/B तुलना</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-lg p-5 border border-red-200">
                <h3 className="font-bold text-red-500 mb-2">❌ मशीन अनुवाद</h3>
                <div className="bg-gray-50 p-3 rounded-xl mb-3 text-sm text-gray-700 whitespace-pre-wrap">{result.baseline?.script || '—'}</div>
                {result.baseline?.audioBase64 && <audio controls className="w-full" src={`data:audio/wav;base64,${result.baseline.audioBase64}`} />}
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-5 border-2 border-green-400">
                <h3 className="font-bold text-green-600 mb-2">✅ हमारा ब्रांड वर्ज़न</h3>
                <div className="bg-green-50 p-3 rounded-xl mb-3 text-sm text-gray-700 whitespace-pre-wrap">{result.generated?.script || '—'}</div>
                {result.generated?.audioBase64 && <audio controls className="w-full" src={`data:audio/wav;base64,${result.generated.audioBase64}`} />}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">४. स्कोरिंग</h3>
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-left py-2">अट्रीब्यूट</th><th className="py-2 text-red-500">बेसलाइन</th><th className="py-2 text-green-600">ब्रांड</th></tr></thead>
                <tbody>
                  {attrList.map((attr, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2 font-medium">{attr}</td>
                      <td className="py-2"><div className="flex gap-1">{[1,2,3,4,5].map(v => <button key={v} onClick={() => handleScore(attr,'baseline',v)} className={`w-7 h-7 rounded-full text-xs ${(scores[attr]?.baseline||0)===v?'bg-red-500 text-white':'bg-gray-200'}`}>{v}</button>)}</div></td>
                      <td className="py-2"><div className="flex gap-1">{[1,2,3,4,5].map(v => <button key={v} onClick={() => handleScore(attr,'generated',v)} className={`w-7 h-7 rounded-full text-xs ${(scores[attr]?.generated||0)===v?'bg-green-500 text-white':'bg-gray-200'}`}>{v}</button>)}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
