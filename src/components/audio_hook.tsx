import { useRef, useState, useCallback } from 'react'

export function useAudio() {
  const audioRef = useRef(null)
  const [playingId, setPlayingId] = useState(null)
  const [isSupported, setIsSupported] = useState(
    typeof window !== 'undefined' && 'speechSynthesis' in window
  )

  const speakBrowser = (text, lang = 'hi-IN') => {
    if (!isSupported) return
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang; u.rate = 0.9; u.pitch = 1.05
    const voices = window.speechSynthesis.getVoices()
    const hindiVoice = voices.find(v => v.lang?.startsWith('hi'))
    if (hindiVoice) u.voice = hindiVoice
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  }

  const playAudio = useCallback((script, b64, id) => {
    if (playingId === id) {
      window.speechSynthesis?.cancel()
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0 }
      setPlayingId(null)
      return
    }

    window.speechSynthesis?.cancel()
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0 }

    if (b64 && audioRef.current) {
      const isWav = b64.startsWith('UklGR') || b64.length > 1000
      audioRef.current.src = 'data:audio/' + (isWav ? 'wav' : 'mp3') + ';base64,' + b64
      audioRef.current.play().catch(() => {
        if (script) { speakBrowser(script); setPlayingId(id) }
      })
      audioRef.current.onended = () => setPlayingId(null)
      setPlayingId(id)
      return
    }

    if (script) {
      speakBrowser(script)
      setPlayingId(id)
      const check = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          clearInterval(check); setPlayingId(null)
        }
      }, 300)
    }
  }, [playingId])

  const stopAudio = useCallback(() => {
    window.speechSynthesis?.cancel()
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0 }
    setPlayingId(null)
  }, [])

  return { audioRef, playingId, playAudio, stopAudio, isSupported }
}
