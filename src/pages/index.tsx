import { useState, useEffect } from 'react'
import { useAudio } from '../components/audio_hook'

const STYLES = {
  container: 'min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-purple-950 text-white',
  inner: 'max-w-6xl mx-auto px-4 py-8 md:py-12',
  header: 'text-center mb-10',
  title: 'text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-orange-400 via-rose-400 to-purple-400 bg-clip-text text-transparent',
  subtitle: 'text-gray-400 mt-3 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed',
  grid: 'grid grid-cols-1 lg:grid-cols-3 gap-6',
  mainCol: 'lg:col-span-2 space-y-5',
  sidebar: 'space-y-5',
  card: 'bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl',
  cardTitle: 'text-lg font-bold text-white mb-1',
  cardSub: 'text-sm text-gray-400 mb-4',
  input: 'w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all',
  textarea: 'w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all font-mono text-sm',
  select: 'w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer',
  btn: 'w-full py-4 bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
  error: 'bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-xl text-sm',
  tag: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-300',
}

function AudioBtn({ script, b64, id, playingId, playAudio }) {
  const isPlaying = playingId === id
  const hasAudio = !!b64
  const hasScript = !!script

  if (!hasScript && !hasAudio) {
    return <div className="h-10 bg-white/5 rounded-xl flex items-center justify-center text-xs text-gray-500">No script</div>
  }

  return (
    <div className="flex gap-2">
      {hasAudio && (
        <button
          onClick={() => playAudio(script, b64, id + '-el')}
          className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all duration-300 ${
            isPlaying ? 'bg-orange-500/80 text-white shadow-lg shadow-orange-500/30' : 'bg-gradient-to-r from-orange-500/90 to-rose-500/90 text-white hover:shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02]'
          }`}
        >
          {isPlaying ? (
            <>
              <span className="flex gap-0.5 items-end h-4">
                <span className="w-0.5 bg-white rounded-full animate-pulse" style={{height: '60%', animationDelay: '0ms'}} />
                <span className="w-0.5 bg-white rounded-full animate-pulse" style={{height: '100%', animationDelay: '100ms'}} />
                <span className="w-0.5 bg-white rounded-full animate-pulse" style={{height: '40%', animationDelay: '200ms'}} />
                <span className="w-0.5 bg-white rounded-full animate-pulse" style={{height: '80%', animationDelay: '150ms'}} />
              </span>
              Stop
            </>
          ) : (
            <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> Play</>
          )}
        </button>
      )}
      {hasScript && !hasAudio && (
        <button
          onClick={() => playAudio(script, '', id + '-bs')}
          className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-sm font-medium border transition-all duration-300 ${
            isPlaying ? 'bg-orange-500/20 border-orange-500/50 text-orange-300' : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20 hover:border-white/40'
          }`}
        >
          {isPlaying ? (
            <>
              <span className="flex gap-0.5 items-end h-4">
                <span className="w-0.5 bg-orange-400 rounded-full animate-pulse" style={{height: '60%', animationDelay: '0ms'}} />
                <span className="w-0.5 bg-orange-400 rounded-full animate-pulse" style={{height: '100%', animationDelay: '100ms'}} />
                <span className="w-0.5 bg-orange-400 rounded-full animate-pulse" style={{height: '40%', animationDelay: '200ms'}} />
              </span>
              Stop
            </>
          ) : (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg> Listen</>
          )}
        </button>
      )}
    </div>
  )
}

export default function Home() {
  const [loading, setLoading] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const { audioRef, playingId, playAudio } = useAudio()
  const [form, setForm] = useState({
    brandName: 'Bombay Skin Co.',
    attributes: 'Uses short punchy sentences\nCalls the customer "yaar"\nPlayful irreverent tone\nMakes fun of competitors\nSlightly mischievous attitude',
    customerName: 'Suman',
    lastPurchase: 'Bought Body Lotion 4 months ago',
    offer: '20% off + Free shipping',
    language: 'hi-IN'
  })

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
    }
  }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  const attrList = form.attributes.split('\\n').filter(a => a.trim())

  const handleGenerate = async () => {
    setLoading(1); setError(''); setResult(null)
    try {
      const r = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const d = await r.json()
      if (!r.ok) throw Error(d.error || 'Something went wrong')
      setResult(d)
    } catch (e) { setError(e.message) }
    finally { setLoading(0) }
  }

  return (
    <div className={STYLES.container}>
      <audio ref={audioRef} className="hidden" />
      <div className={STYLES.inner}>
        <div className={STYLES.header}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Sarvam-30B + ElevenLabs
          </div>
          <h1 className={STYLES.title}>Brand Voice<br/>Reactivation</h1>
          <p className={STYLES.subtitle}>Make your brand sound like your brand — in a language it has never spoken before</p>
        </div>

        <div className={STYLES.grid}>
          <div className={STYLES.mainCol}>
            <div className={STYLES.card}>
              <h2 className={STYLES.cardTitle}>1. Brand Personality</h2>
              <p className={STYLES.cardSub}>Define 3-5 testable attributes (not adjectives)</p>
              <textarea name="attributes" value={form.attributes} onChange={handleChange} className={STYLES.textarea} rows={5} />
              <input name="brandName" value={form.brandName} onChange={handleChange} className={STYLES.input + ' mt-3'} placeholder="Brand name" />
            </div>

            <div className={STYLES.card}>
              <h2 className={STYLES.cardTitle}>2. Customer &#38; Offer</h2>
              <p className={STYLES.cardSub + ' mb-4'}>Target audience and what you are offering</p>
              <div className="grid grid-cols-2 gap-3">
                <input name="customerName" value={form.customerName} onChange={handleChange} className={STYLES.input} placeholder="Customer name" />
                <select name="language" value={form.language} onChange={handleChange} className={STYLES.select}>
                  <option value="hi-IN" className="bg-gray-800">Hindi</option>
                  <option value="mr-IN" className="bg-gray-800">Marathi</option>
                  <option value="ta-IN" className="bg-gray-800">Tamil</option>
                  <option value="te-IN" className="bg-gray-800">Telugu</option>
                  <option value="bn-IN" className="bg-gray-800">Bengali</option>
                </select>
              </div>
              <input name="lastPurchase" value={form.lastPurchase} onChange={handleChange} className={STYLES.input + ' mt-3'} placeholder="Last purchase" />
              <input name="offer" value={form.offer} onChange={handleChange} className={STYLES.input + ' mt-3'} placeholder="Offer" />
            </div>

            <button onClick={handleGenerate} disabled={!!!loading} className={STYLES.btn}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Generating...
                </span>
              ) : 'Generate Scripts'
            }
            </button>

            {error && <div className={STYLES.error}>{error}</div>}
          </div>

          <div className={STYLES.sidebar}>
            <div className={`${STYLES.card} p-4`}>
              <h3 className="text-sm font-semibold text-gray-200 mb-3">Attributes</h3>
              <div className="space-y-1.5">
                {attrList.map((a, i) => (
                  <div key={i} className="text-xs py-2 px-3 bg-white/5 rounded-lg text-gray-400 border border-white/5">{a}</div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 backdrop-blur-xl rounded-2xl p-5 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold">?</div>
                <div>
                  <h3 className="font-semibold text-sm text-purple-300">How this works</h3>
                </div>
              </div>
              <p className="text-xs text-purple-300/70 leading-relaxed">
                Sarvam-30B generates the script with your brand personality. Audio is produced via ElevenLabs multilingual TTS. If premium TTS is unavailable, your browser reads it aloud in Hindi.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Language:</span>
                <span className={STYLES.tag}>
                  {form.language === 'hi-IN' ? 'Hindi' : form.language === 'mr-IN' ? 'Marathi' : form.language === 'ta-IN' ? 'Tamil' : form.language === 'te-IN' ? 'Telugu' : 'Bengali'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {result && (
          <div className="mt-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">A/B Comparison</h2>
              <span className={STYLES.tag}>Anika (ElevenLabs) ☦ Hindi</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-sm font-bold text-gray-300">B</div>
                  <div>
                    <h3 className="font-semibold text-sm text-white">Baseline</h3>
                    <p className="text-xs text-gray-500">Machine translated</p>
                  </div>
                </div>
                <AudioBtn script={result.baseline?.script} b64={result.baseline?.audioBase64} id="baseline" playingId={playingId} playAudio={playAudio} />
                <div className="mt-3 text-xs text-gray-400 bg-white/5 rounded-xl p-3 max-h-32 overflow-y-auto leading-relaxed">{result.baseline?.script || 'No script'}</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500/5 to-rose-500/5 rounded-2xl p-5 border border-orange-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-sm font-bold">A</div>
                  <div>
                    <h3 className="font-semibold text-sm text-white">Brand Generated</h3>
                    <p className="text-xs text-orange-400/70">Personality-constrained</p>
                  </div>
                </div>
                <AudioBtn script={result.generated?.script} b64={result.generated?.audioBase64} id="generated" playingId={playingId} playAudio={playAudio} />
                <div className="mt-3 text-xs text-orange-200/80 bg-orange-500/5 rounded-xl p-3 max-h-32 overflow-y-auto leading-relaxed">{result.generated?.script || 'No script'}</div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-8 text-xs text-gray-600">
          Powered by Sarvam AI + ElevenLabs
        </div>
      </div>
    </div>
  )
}
