import { useState, useEffect, useRef, useCallback } from 'react'
import { CLIENTS, CLIENT_COLORS } from '../lib/clients.js'
import { buildFeedbackSystemPrompt } from '../lib/prompts.js'
import { sendFeedbackMessage } from '../lib/api.js'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis.js'
import { PhaseIndicator } from './SetupScreen.jsx'
import MessageBubble from './MessageBubble.jsx'

const FEEDBACK_DURATION = 5 * 60

export default function FeedbackScreen({ clientId, interviewMessages, onFeedbackComplete }) {
  const client = CLIENTS[clientId]
  const colors = CLIENT_COLORS[client.color]
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

  const { isListening, isSupported: isSpeechSupported, startListening, stopListening } = useSpeechRecognition({ onResult: handleSpeechResult })

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isLoading])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); return 0 } return t - 1 })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    if (autoStarted) return
    setAutoStarted(true)
    setIsLoading(true)
    sendFeedbackMessage(systemPrompt, [{ role: 'user', content: 'The interview just ended. Please share your honest feedback.' }], clientId, true)
      .then(text => {
        setMessages([{ role: 'assistant', content: text }])
        if (voiceEnabled) speak(text)
      })
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  const timesUp = timeLeft === 0
  const timerUrgent = timeLeft <= 60

  const sendUserMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return
    setError(null)
    const userMessage = { role: 'user', content: text.trim() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)
    try {
      const responseText = await sendFeedbackMessage(systemPrompt, updatedMessages, clientId, false)
      const assistantMessage = { role: 'assistant', content: responseText }
      setMessages(prev => [...prev, assistantMessage])
      if (voiceEnabled) speak(responseText)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading, systemPrompt, voiceEnabled, speak, client.name])

  const handleSubmit = (e) => { e.preventDefault(); sendUserMessage(input) }
  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendUserMessage(input) } }

  const handleComplete = () => {
    clearInterval(timerRef.current)
    cancelSpeech()
    onFeedbackComplete(interviewMessages, messages)
  }

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      <header className="bg-white border-b border-warm-200 px-4 py-3 flex-shrink-0 shadow-softer">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center font-bold flex-shrink-0`}>
              {client.name[0]}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{client.name} — Reflection</p>
              <p className="text-xs text-gray-400">Client feedback session</p>
            </div>
          </div>
          <div className={`text-xl font-mono font-bold tabular-nums px-3 py-1.5 rounded-xl ${
            timerUrgent ? 'bg-red-50 text-red-600 ring-1 ring-red-200' : 'bg-warm-100 text-gray-700'
          }`}>
            {formatTime(timeLeft)}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setVoiceEnabled(v => !v); if (isSpeaking) cancelSpeech() }}
              className={`p-2 rounded-xl text-sm transition-colors ${voiceEnabled ? 'bg-sage-50 text-sage-600 hover:bg-sage-100' : 'bg-warm-100 text-gray-400'}`}
            >
              {voiceEnabled ? '🔊' : '🔇'}
            </button>
            <button
              onClick={handleComplete}
              className="px-3 py-1.5 bg-sage-600 hover:bg-sage-700 text-white text-sm font-medium rounded-xl transition-colors shadow-soft"
            >
              {timesUp ? 'View Assessment →' : 'Get Assessment'}
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-warm-200 px-4 py-2.5 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <PhaseIndicator currentPhase="feedback" />
        </div>
      </div>

      <div className="bg-sage-50 border-b border-sage-100 px-4 py-3 flex-shrink-0">
        <p className="max-w-3xl mx-auto text-sm text-sage-800">
          The interview is over. {client.name} is sharing how the experience felt from their side. Ask follow-up questions — what helped, what felt rushed, what made them feel heard.
        </p>
      </div>

      {timesUp && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex-shrink-0">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <p className="text-amber-800 text-sm">Feedback time complete. Ready for your performance assessment?</p>
            <button onClick={handleComplete} className="flex-shrink-0 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 transition-colors">
              View Assessment →
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          {isLoading && messages.length === 0 && (
            <div className="flex items-end gap-2.5">
              <div className={`w-8 h-8 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                {client.name[0]}
              </div>
              <div className="bg-white border border-warm-100 shadow-softer rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center h-4">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} clientId={clientId} />
          ))}
          {isLoading && messages.length > 0 && (
            <div className="flex items-end gap-2.5">
              <div className={`w-8 h-8 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                {client.name[0]}
              </div>
              <div className="bg-white border border-warm-100 shadow-softer rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center h-4">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          {error && <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700">{error}</div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex-shrink-0 border-t border-warm-200 bg-white px-4 py-3">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for feedback or respond to what they shared..."
              rows={2}
              className="flex-1 resize-none bg-warm-50 border border-warm-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition-all placeholder-gray-400"
              disabled={isLoading}
            />
            {isSpeechSupported && (
              <button
                type="button"
                onMouseDown={startListening}
                onMouseUp={stopListening}
                onTouchStart={startListening}
                onTouchEnd={stopListening}
                className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                  isListening ? 'bg-red-500 text-white scale-110 ring-4 ring-red-100' : 'bg-warm-100 text-gray-500 hover:bg-warm-200'
                }`}
              >
                {isListening ? '⏹' : '🎤'}
              </button>
            )}
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 w-11 h-11 rounded-2xl bg-sage-600 text-white flex items-center justify-center hover:bg-sage-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-soft"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
