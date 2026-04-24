import { useState, useEffect, useRef, useCallback } from 'react'
import { CLIENTS } from '../lib/clients.js'
import { buildFeedbackSystemPrompt } from '../lib/prompts.js'
import { sendMessage } from '../lib/api.js'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis.js'
import { PhaseIndicator } from './SetupScreen.jsx'
import MessageBubble from './MessageBubble.jsx'

const FEEDBACK_DURATION = 5 * 60

export default function FeedbackScreen({ clientId, interviewMessages, onFeedbackComplete }) {
  const client = CLIENTS[clientId]
  const systemPrompt = buildFeedbackSystemPrompt(client)

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(FEEDBACK_DURATION)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [error, setError] = useState(null)
  const [autoStarted, setAutoStarted] = useState(false)

  const messagesEndRef = useRef(null)
  const timerRef = useRef(null)

  const { speak, cancel: cancelSpeech, isSpeaking } = useSpeechSynthesis()

  const handleSpeechResult = useCallback((transcript) => {
    setInput(prev => prev ? `${prev} ${transcript}` : transcript)
  }, [])

  const { isListening, isSupported: isSpeechSupported, startListening, stopListening } = useSpeechRecognition({
    onResult: handleSpeechResult,
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Start timer immediately
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  // Auto-trigger opening feedback message from client
  useEffect(() => {
    if (autoStarted) return
    setAutoStarted(true)

    const openingPrompt = `The interview just ended. I (the social work student) am now asking you for your honest feedback. Please share your initial impressions of how the interview felt from your perspective.`

    const triggerMessages = [{ role: 'user', content: openingPrompt }]
    setIsLoading(true)

    sendMessage(systemPrompt, triggerMessages)
      .then(responseText => {
        setMessages([{ role: 'assistant', content: responseText }])
        if (voiceEnabled) speak(responseText)
      })
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  const timerColor = timeLeft <= 60 ? 'text-red-600' : timeLeft <= 120 ? 'text-amber-600' : 'text-navy-700'
  const timesUp = timeLeft === 0

  const sendUserMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return
    setError(null)

    const userMessage = { role: 'user', content: text.trim() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      const responseText = await sendMessage(systemPrompt, updatedMessages)
      const assistantMessage = { role: 'assistant', content: responseText }
      setMessages(prev => [...prev, assistantMessage])
      if (voiceEnabled) speak(responseText)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading, systemPrompt, voiceEnabled, speak])

  const handleSubmit = (e) => {
    e.preventDefault()
    sendUserMessage(input)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendUserMessage(input)
    }
  }

  const handleComplete = () => {
    clearInterval(timerRef.current)
    cancelSpeech()
    onFeedbackComplete(interviewMessages, messages)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-teal-700 text-white px-4 py-3 flex-shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-teal-100 text-xs font-medium uppercase tracking-wide">Client Feedback — {client.name}</p>
            <p className="text-sm text-teal-200 mt-0.5">Ask {client.name} what was helpful and what wasn't</p>
          </div>
          <div className={`text-2xl font-mono font-bold tabular-nums ${timerColor} bg-white rounded-lg px-3 py-1`}>
            {formatTime(timeLeft)}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setVoiceEnabled(v => !v); if (isSpeaking) cancelSpeech() }}
              className={`p-2 rounded-lg text-sm transition-colors ${voiceEnabled ? 'bg-teal-600 text-white' : 'bg-teal-800 text-teal-400'}`}
            >
              {voiceEnabled ? '🔊' : '🔇'}
            </button>
            <button
              onClick={handleComplete}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {timesUp ? 'Continue to Assessment' : 'End & Get Assessment'}
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <PhaseIndicator currentPhase="feedback" />
        </div>
      </div>

      <div className="bg-teal-50 border-b border-teal-100 px-4 py-3 flex-shrink-0">
        <p className="max-w-3xl mx-auto text-sm text-teal-800">
          The interview is over. {client.name} will now share honest feedback. Ask follow-up questions about what worked, what felt rushed, or what made {client.pronouns === 'she/her' ? 'her' : 'him'} comfortable.
        </p>
      </div>

      {timesUp && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex-shrink-0">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <p className="text-amber-800 text-sm font-medium">Feedback time complete. Ready for your performance assessment?</p>
            <button onClick={handleComplete} className="ml-4 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors">
              View Assessment
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {isLoading && messages.length === 0 && (
            <div className="flex justify-start">
              <div className="bg-teal-50 border border-teal-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} clientName={client.name} />
          ))}
          {isLoading && messages.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-teal-50 border border-teal-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 py-3">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for feedback or respond to what the client shared..."
              rows={2}
              className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              disabled={isLoading}
            />
            {isSpeechSupported && (
              <button
                type="button"
                onMouseDown={startListening}
                onMouseUp={stopListening}
                onTouchStart={startListening}
                onTouchEnd={stopListening}
                className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  isListening ? 'bg-red-500 text-white scale-110 ring-4 ring-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isListening ? '⏹' : '🎤'}
              </button>
            )}
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 w-11 h-11 rounded-xl bg-teal-700 text-white flex items-center justify-center hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
