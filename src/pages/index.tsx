'use client'
import { useState, useEffect, useRef } from 'react'

const S = {
  wrap: 'min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/40 to-rose-50/30',
  inner: 'max-w-6xl mx-auto px-4 py-8 md:py-12',
  header: 'text-center mb-10',
  badge: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/60 border border-white/50 text-gray-500 mb-4',
  title: 'text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 bg-clip-text text-transparent leading-tight',
  sub: 'text-gray-500 mt-3 text-base md:text-lg max-w-xl mx-auto leading-relaxed',
  grid: 'grid grid-cols-1 lg:grid-cols-3 gap-6',
  mainCol: 'lg:col-span-2 space-y-5',
  sideCol: 'space-y-5',
  card: 'bg-white/80 backdrop-blur-xl rounded-2xl p-5 md:p-6 border border-white/40 shadow-sm hover:shadow-md transition-shadow duration-300',
  cardTitle: 'text-base font-bold text-gray-800 mb-1',
  cardSub: 'text-xs text-gray-400 mb-4',
  label: 'text-xs font-medium text-gray-500 mb-1.5 ml-0.5',
  input: 'w-full bg-white/70 border border-gray-200/60 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400/50 transition-all',
  textarea: 'w-full bg-white/70 border border-gray-200/60 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400/50 transition-all font-mono resize-none',
  select: 'w-full bg-white/70 border border-gray-200/60 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400/40 cursor-pointer',
  btn: 'w-full py-3.5 bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 text-white font-bold text-base rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
  error: 'bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-xl text-sm',
  pill: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
  sectionLabel: 'text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-3',
}

export default function Home() {
  const [loading, setLoading] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [playingId, setPlayingId] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

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
      const load = () => setVoices(window.speechSynthesis.getVoices())
      load()
      window.speechSynthesis.onvoiceschanged = load
    }
  }, [])

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value })
  const attrList = form.attributes.split('\n').filter(a => a.trim())

  const handleGenerate = async () => {
    setLoading(1); setError(''); setResult(null)
    try {
      const r = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Something went wrong')
      setResult(d)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(0) }
  }

  const speak = (text: string, b64: string, id: string) => {
    if (playingId === id) {
      setPlayingId('')
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
      window.speechSynthesis.cancel()
      return
    }
    window.speechSynthesis.cancel()

    if (b64) {
      setPlayingId(id)
      if (audioRef.current) audioRef.current.pause()
      const audio = new Audio(`data:audio/mp3;base64,${b64}`)
      audioRef.current = audio
      audio.onended = () => setPlayingId('')
      audio.onerror = () => {
        setPlayingId('')
        if (text) fallbackSpeak(text, id)
      }
      audio.play().catch(() => {
        if (text) fallbackSpeak(text, id)
        else setPlayingId('')
      })
    } else if (text) {
      fallbackSpeak(text, id)
    }
  }

  const fallbackSpeak = (text: string, id: string) => {
    setPlayingId(id)
    const u = new SpeechSynthesisUtterance(text)
    u.lang = form.language
    u.rate = 0.85
    u.pitch = 1.05
    const hi = voices.find(v => v.lang.startsWith('hi'))
    if (hi) u.voice = hi
    u.onend = () => setPlayingId('')
    u.onerror = () => setPlayingId('')
    window.speechSynthesis.speak(u)
  }

  const PlayBtn = ({ script, b64, id }: { script?: string; b64?: string; id: string }) => {
    const isPlaying = playingId === id
    const hasScript = !!script

    if (!hasScript) {
      return <div className="h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xs text-gray-400">No script</div>
    }

    return (
      <button onClick={() => speak(script || '', b64 || '', id)}
        className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all duration-300 ${
          isPlaying
            ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/30'
            : b64
            ? 'bg-gradient-to-r from-orange-500/90 to-rose-500/90 text-white hover:shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02]'
            : 'bg-white/60 border border-gray-200/60 text-gray-500 hover:bg-white/80'
        }`}
      >
        {isPlaying ? (
          <span className="flex gap-0.5 items-end h-4">
            <span className="w-0.5 bg-white rounded-full animate-pulse" style={{ height: '60%', animationDelay: '0ms' }} />
            <span className="w-0.5 bg-white rounded-full animate-pulse" style={{ height: '100%', animationDelay: '100ms' }} />
            <span className="w-0.5 bg-white rounded-full animate-pulse" style={{ height: '40%', animationDelay: '200ms' }} />
            <span className="w-0.5 bg-white rounded-full animate-pulse" style={{ height: '80%', animationDelay: '150ms' }} />
          </span>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        )}
        {isPlaying ? 'Stop' : b64 ? 'Play' : 'Listen'}
      </button>
    )
  }

  const langLabel = (l: string) => {
    const m: any = { 'hi-IN': 'Hindi', 'mr-IN': 'Marathi', 'ta-IN': 'Tamil', 'te-IN': 'Telugu', 'bn-IN': 'Bengali' }
    return m[l] || l
  }

  return (
    <div className={S.wrap}>
      <audio ref={audioRef} className="hidden" />
      <div className={S.inner}>
        <div className={S.header}>
          <div className={S.badge}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Sarvam 30B + ElevenLabs
          </div>
          <h1 className={S.title}>
            Brand Voice<br />Reactivation
          </h1>
          <p className={S.sub}>
            Make your brand sound like your brand — in a language it's never spoken before
          </p>
        </div>

        <div className={S.grid}>
          {/* Main Column */}
          <div className={S.mainCol}>
            {/* Step 1 */}
            <div className={S.card}>
              <div className={S.sectionLabel}>Step 1</div>
              <h2 className={S.cardTitle}>Brand Personality</h2>
              <p className={S.cardSub}>Define 3-5 testable attributes (not adjectives)</p>
              <div className={S.label}>Attributes</div>
              <textarea name="attributes" value={form.attributes} onChange={handleChange}
                className={S.textarea} rows={5} />
              <div className="mt-3">
                <div className={S.label}>Brand Name</div>
                <input name="brandName" value={form.brandName} onChange={handleChange}
                  className={S.input} placeholder="Brand name" />
              </div>
            </div>

            {/* Step 2 */}
            <div className={S.card}>
              <div className={S.sectionLabel}>Step 2</div>
              <h2 className={S.cardTitle}>Customer & Offer</h2>
              <p className={S.cardSub}>Target audience and what you're offering</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className={S.label}>Customer Name</div>
                  <input name="customerName" value={form.customerName} onChange={handleChange}
                    className={S.input} placeholder="Customer name" />
                </div>
                <div>
                  <div className={S.label}>Language</div>
                  <select name="language" value={form.language} onChange={handleChange} className={S.select}>
                    <option value="hi-IN">Hindi</option>
                    <option value="mr-IN">Marathi</option>
                    <option value="ta-IN">Tamil</option>
                    <option value="te-IN">Telugu</option>
                    <option value="bn-IN">Bengali</option>
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <div className={S.label}>Last Purchase</div>
                <input name="lastPurchase" value={form.lastPurchase} onChange={handleChange}
                  className={S.input} placeholder="Last purchase" />
              </div>
              <div className="mt-3">
                <div className={S.label}>Offer</div>
                <input name="offer" value={form.offer} onChange={handleChange}
                  className={S.input} placeholder="Offer" />
              </div>
            </div>

            {/* CTA */}
            <button onClick={handleGenerate} disabled={!!loading} className={S.btn}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </span>
              ) : 'Generate Scripts'}
            </button>

            {error && <div className={S.error}>{error}</div>}

            {/* A/B Comparison */}
            {result && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 md:p-6 border border-white/40 shadow-sm mt-5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
                    A/B Comparison
                  </h2>
                  <span className={S.pill + ' bg-gray-100/80 text-gray-500 border border-gray-200/50'}>
                    {langLabel(form.language)}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Baseline */}
                  <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200/40">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-xs font-bold text-white">B</div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700">Baseline</h3>
                        <p className="text-[11px] text-gray-400">Machine translated</p>
                      </div>
                    </div>
                    <PlayBtn script={result.baseline?.script} b64={result.baseline?.audioBase64} id="baseline" />
                    <div className="mt-2 text-xs text-gray-500 bg-white/50 rounded-lg p-2.5 max-h-28 overflow-y-auto leading-relaxed">
                      {result.baseline?.script || 'No script'}
                    </div>
                  </div>

                  {/* Generated */}
                  <div className="bg-gradient-to-br from-orange-50/80 to-rose-50/80 rounded-xl p-4 border border-orange-200/40">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-xs font-bold text-white">A</div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800">Brand Generated</h3>
                        <p className="text-[11px] text-orange-500/70">Personality-constrained</p>
                      </div>
                    </div>
                    <PlayBtn script={result.generated?.script} b64={result.generated?.audioBase64} id="generated" />
                    <div className="mt-2 text-xs text-gray-600 bg-white/60 rounded-lg p-2.5 max-h-28 overflow-y-auto leading-relaxed">
                      {result.generated?.script || 'No script'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className={S.sideCol}>
            {/* Attributes */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-white/40 shadow-sm">
              <div className={S.sectionLabel}>Attributes</div>
              <div className="space-y-1.5">
                {attrList.map((a, i) => (
                  <div key={i} className="text-xs py-1.5 px-2.5 bg-gray-50 rounded-lg text-gray-500 border border-gray-100">
                    {a}
                  </div>
                ))}
              </div>
            </div>

            {/* How this works */}
            <div className="bg-gradient-to-br from-purple-500/5 to-indigo-500/5 backdrop-blur-xl rounded-2xl p-5 border border-purple-200/30 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">?</div>
                <h3 className="text-sm font-semibold text-purple-700">How this works</h3>
              </div>
              <p className="text-xs text-purple-600/70 leading-relaxed">
                Sarvam-30B generates the script with your brand personality. Audio is produced via ElevenLabs multilingual TTS. If premium TTS is unavailable, your browser reads it aloud in Hindi.
              </p>
            </div>

            {/* Language */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-white/40 shadow-sm">
              <div className={S.sectionLabel}>Language</div>
              <div className="flex items-center gap-2">
                <span className={S.pill + ' bg-gray-50 text-gray-500 border border-gray-200/50'}>
                  {langLabel(form.language)}
                </span>
                <span className="text-[11px] text-gray-400">5 languages supported</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-xs text-gray-400">
          Powered by Sarvam AI + ElevenLabs
        </div>
      </div>
    </div>
  )
}
