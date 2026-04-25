import { useState, useCallback, useRef } from 'react'
import { USE_ELEVENLABS, speakWithElevenLabs } from '../lib/api.js'

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const audioRef = useRef(null)
  const objectUrlRef = useRef(null)

  const cancel = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    window.speechSynthesis?.cancel()
    setIsSpeaking(false)
  }, [])

  const speak = useCallback(async (text, voiceId) => {
    const cleanText = text.replace(/\*[^*]+\*/g, '').replace(/\[[^\]]+\]/g, '').replace(/\s{2,}/g, ' ').trim()
    cancel()
    text = cleanText

    if (USE_ELEVENLABS && voiceId) {
      setIsSpeaking(true)
      try {
        const url = await speakWithElevenLabs(text, voiceId)
        objectUrlRef.current = url
        const audio = new Audio(url)
        audioRef.current = audio
        audio.onended = () => {
          URL.revokeObjectURL(url)
          objectUrlRef.current = null
          audioRef.current = null
          setIsSpeaking(false)
        }
        audio.onerror = () => {
          setIsSpeaking(false)
          // Silently fall back — don't break the conversation flow
        }
        await audio.play()
      } catch {
        setIsSpeaking(false)
        // ElevenLabs failed — fall through to browser TTS
        speakWithBrowser(text, setIsSpeaking)
      }
      return
    }

    speakWithBrowser(text, setIsSpeaking)
  }, [cancel])

  return { speak, cancel, isSpeaking, isSupported: true }
}

function speakWithBrowser(text, setIsSpeaking) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.95
  utterance.lang = 'en-US'
  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find(v => v.lang.startsWith('en') && v.localService)
  if (preferred) utterance.voice = preferred
  utterance.onstart = () => setIsSpeaking(true)
  utterance.onend   = () => setIsSpeaking(false)
  utterance.onerror = () => setIsSpeaking(false)
  window.speechSynthesis.speak(utterance)
}
