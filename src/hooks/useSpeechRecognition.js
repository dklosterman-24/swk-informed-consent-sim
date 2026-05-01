import { useState, useEffect, useRef, useCallback } from 'react'

export function useSpeechRecognition({ onResult }) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef(null)
  // Tracks whether the button is physically held — separate from recognition engine state.
  // The browser's silence detection can fire onend even mid-hold; this ref lets us restart.
  const isHeldRef = useRef(false)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setIsSupported(true)
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        onResult(transcript)
      }

      recognition.onerror = (event) => {
        if (isHeldRef.current && event.error === 'no-speech') {
          try { recognition.start() } catch (_) {}
        } else {
          isHeldRef.current = false
          setIsListening(false)
        }
      }

      recognition.onend = () => {
        if (isHeldRef.current) {
          try { recognition.start() } catch (_) {}
        } else {
          setIsListening(false)
        }
      }

      recognitionRef.current = recognition
    }
  }, [onResult])

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      isHeldRef.current = true
      setIsListening(true)
      try { recognitionRef.current.start() } catch (_) {}
    }
  }, [])

  const stopListening = useCallback(() => {
    isHeldRef.current = false
    setIsListening(false)
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (_) {}
    }
  }, [])

  return { isListening, isSupported, startListening, stopListening }
}
