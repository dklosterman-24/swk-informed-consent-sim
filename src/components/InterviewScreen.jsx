import { useState, useEffect, useRef, useCallback } from 'react'
import { CLIENTS, INTERVIEW_GUIDE, AGENCY_SERVICES, INFORMED_CONSENT_TEXT } from '../lib/clients.js'
import { buildClientSystemPrompt } from '../lib/prompts.js'
import { sendChatMessage } from '../lib/api.js'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis.js'
import { PhaseIndicator } from './SetupScreen.jsx'
import MessageBubble from './MessageBubble.jsx'

const INTERVIEW_DURATION = 20 * 60 // seconds

export default function InterviewScreen({ clientId, onInterviewComplete }) {
  const client = CLIENTS[clientId]
  const systemPrompt = buildClientSystemPrompt(client)

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(INTERVIEW_DURATION)
  const [timerStarted, setTimerStarted] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [guideOpen, setGuideOpen] = useState(false)
  const [consentOpen, setConsentOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [error, setError] = useState(null)

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const timerRef = useRef(null)

  const { speak, cancel: cancelSpeech, isSpeaking } = useSpeechSynthesis()

  const handleSpeechResult = useCallback((transcript) => {
    setInput(prev => prev ? `${prev} ${transcript}` : transcript)
  }, [])

  const { isListening, isSupported: isSpeechSupported, startListening, stopListening } = useSpeechRecognition({
    onResult: handleSpeechResult,
  })

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Timer
  useEffect(() => {
    if (!timerStarted) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [timerStarted])

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const timerColor = timeLeft <= 120 ? 'text-red-600' : timeLeft <= 300 ? 'text-amber-600' : 'text-navy-700'

  const sendUserMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return
    setError(null)
    if (!timerStarted) setTimerStarted(true)

    const userMessage = { role: 'user', content: text.trim() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      const responseText = await sendChatMessage(systemPrompt, updatedMessages, client.name)
      const assistantMessage = { role: 'assistant', content: responseText }
      setMessages(prev => [...prev, assistantMessage])
      if (voiceEnabled) speak(responseText)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading, systemPrompt, voiceEnabled, speak, timerStarted])

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

  const handleEndInterview = () => {
    clearInterval(timerRef.current)
    cancelSpeech()
    onInterviewComplete(messages)
  }

  const timesUp = timeLeft === 0

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-navy-700 text-white px-4 py-3 flex-shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-navy-100 text-xs font-medium uppercase tracking-wide">Interview — {client.name}</p>
          </div>
          <div className={`text-2xl font-mono font-bold tabular-nums ${timerColor} bg-white rounded-lg px-3 py-1`}>
            {formatTime(timeLeft)}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setVoiceEnabled(v => !v); if (isSpeaking) cancelSpeech() }}
              title={voiceEnabled ? 'Disable client voice' : 'Enable client voice'}
              className={`p-2 rounded-lg text-sm transition-colors ${voiceEnabled ? 'bg-navy-600 text-white' : 'bg-navy-800 text-navy-400'}`}
            >
              {voiceEnabled ? '🔊' : '🔇'}
            </button>
            <button
              onClick={handleEndInterview}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {timesUp ? 'Time\'s Up — Continue' : 'End Interview'}
            </button>
          </div>
        </div>
      </header>

      {/* Phase indicator */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
        <div className="max-w-5xl mx-auto">
          <PhaseIndicator currentPhase="interview" />
        </div>
      </div>

      {timesUp && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex-shrink-0">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <p className="text-amber-800 text-sm font-medium">Time is up. When you're ready, end the interview to begin the client feedback session.</p>
            <button onClick={handleEndInterview} className="ml-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors">
              Begin Feedback Session
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex max-w-5xl mx-auto w-full">
        {/* Main chat */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="w-16 h-16 rounded-full bg-navy-100 flex items-center justify-center text-2xl mx-auto mb-3">
                  {client.name[0]}
                </div>
                <p className="text-sm">{client.name} is waiting. Greet your client to begin.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} clientName={client.name} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-navy-50 border border-navy-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5 items-center">
                    <div className="w-2 h-2 bg-navy-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-navy-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-navy-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                Connection error: {error}. Check that your API server is running.
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 py-3">
            <form onSubmit={handleSubmit} className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type or use the mic to speak to your client..."
                rows={2}
                className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                disabled={isLoading}
              />
              {isSpeechSupported && (
                <button
                  type="button"
                  onMouseDown={startListening}
                  onMouseUp={stopListening}
                  onTouchStart={startListening}
                  onTouchEnd={stopListening}
                  title="Hold to speak"
                  className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                    isListening
                      ? 'bg-red-500 text-white scale-110 ring-4 ring-red-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isListening ? '⏹' : '🎤'}
                </button>
              )}
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 w-11 h-11 rounded-xl bg-navy-700 text-white flex items-center justify-center hover:bg-navy-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
            {isListening && (
              <p className="text-xs text-red-500 mt-1 ml-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
                Listening... release to stop
              </p>
            )}
          </div>
        </div>

        {/* Right sidebar — reference panel */}
        <div className="hidden lg:flex flex-col w-64 border-l border-gray-200 bg-white flex-shrink-0 overflow-y-auto">
          <div className="p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Reference</p>

            {/* Interview guide */}
            <div>
              <button
                onClick={() => setGuideOpen(o => !o)}
                className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-navy-700 py-1"
              >
                <span>Interview Guide</span>
                <span className="text-gray-400">{guideOpen ? '−' : '+'}</span>
              </button>
              {guideOpen && (
                <ol className="mt-2 space-y-2">
                  {INTERVIEW_GUIDE.map(item => (
                    <li key={item.id} className="flex gap-2 text-xs text-gray-600">
                      <span className="flex-shrink-0 font-bold text-navy-700">{item.id}.</span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Informed consent */}
            <div>
              <button
                onClick={() => setConsentOpen(o => !o)}
                className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-navy-700 py-1"
              >
                <span>Informed Consent</span>
                <span className="text-gray-400">{consentOpen ? '−' : '+'}</span>
              </button>
              {consentOpen && (
                <pre className="mt-2 whitespace-pre-wrap text-xs text-gray-600 font-sans leading-relaxed">
                  {INFORMED_CONSENT_TEXT}
                </pre>
              )}
            </div>

            {/* Agency services */}
            <div>
              <button
                onClick={() => setServicesOpen(o => !o)}
                className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-navy-700 py-1"
              >
                <span>Agency Services</span>
                <span className="text-gray-400">{servicesOpen ? '−' : '+'}</span>
              </button>
              {servicesOpen && (
                <div className="mt-2 space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-1">Services</p>
                    <ul className="space-y-0.5">
                      {AGENCY_SERVICES.services.map(s => (
                        <li key={s} className="text-xs text-gray-600 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-navy-500" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-1">Populations</p>
                    <ul className="space-y-0.5">
                      {AGENCY_SERVICES.populations.map(p => (
                        <li key={p} className="text-xs text-gray-600 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-navy-500" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
