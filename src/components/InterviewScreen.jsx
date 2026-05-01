import { useState, useEffect, useRef, useCallback } from 'react'
import { CLIENTS, CLIENT_COLORS, INTERVIEW_GUIDE, AGENCY_SERVICES, INFORMED_CONSENT_TEXT } from '../lib/clients.js'
import { buildClientSystemPrompt } from '../lib/prompts.js'
import { sendChatMessage } from '../lib/api.js'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis.js'
import { PhaseIndicator } from './SetupScreen.jsx'
import MessageBubble from './MessageBubble.jsx'
import ClientAvatar from './ClientAvatar.jsx'

const INTERVIEW_DURATION = 20 * 60

export default function InterviewScreen({ clientId, onInterviewComplete }) {
  const client = CLIENTS[clientId]
  const colors = CLIENT_COLORS[client.color]
  const systemPrompt = buildClientSystemPrompt(client)

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(INTERVIEW_DURATION)
  const [timerStarted, setTimerStarted] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [panelOpen, setPanelOpen] = useState(true)
  const [panelTab, setPanelTab] = useState('guide')
  const [error, setError] = useState(null)
  const [isVoiceInput, setIsVoiceInput] = useState(false)
  const [showVoiceTip, setShowVoiceTip] = useState(() => !localStorage.getItem('swk-voice-tip-seen'))

  const messagesEndRef = useRef(null)
  const timerRef = useRef(null)

  const { speak, cancel: cancelSpeech, isSpeaking } = useSpeechSynthesis()

  const handleSpeechResult = useCallback((transcript) => {
    setInput(prev => prev ? `${prev} ${transcript}` : transcript)
    setIsVoiceInput(true)
  }, [])

  const { isListening, isSupported: isSpeechSupported, startListening, stopListening } = useSpeechRecognition({ onResult: handleSpeechResult })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (!timerStarted) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [timerStarted])

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  const timesUp = timeLeft === 0
  const timerUrgent = timeLeft <= 120
  const timerWarning = timeLeft <= 300 && !timerUrgent

  const sendUserMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return
    setError(null)
    if (!timerStarted) setTimerStarted(true)

    const userMessage = { role: 'user', content: text.trim() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsVoiceInput(false)
    setIsLoading(true)

    try {
      const responseText = await sendChatMessage(systemPrompt, updatedMessages, clientId)
      const assistantMessage = { role: 'assistant', content: responseText }
      setMessages(prev => [...prev, assistantMessage])
      if (voiceEnabled) speak(responseText, client.voiceId)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading, systemPrompt, voiceEnabled, speak, timerStarted, client.name])

  const handleSubmit = (e) => { e.preventDefault(); sendUserMessage(input) }
  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendUserMessage(input) } }

  const handleEnd = () => {
    clearInterval(timerRef.current)
    cancelSpeech()
    onInterviewComplete(messages)
  }

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-warm-200 px-4 py-3 flex-shrink-0 shadow-softer">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <ClientAvatar client={client} size="md" />
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 truncate">{client.name}, {client.age}</p>
              <p className="text-xs text-gray-400">{client.pronouns} · First session</p>
            </div>
          </div>

          <div className={`text-xl font-mono font-bold tabular-nums px-3 py-1.5 rounded-xl ${
            timerUrgent  ? 'bg-red-50 text-red-600 ring-1 ring-red-200' :
            timerWarning ? 'bg-amber-50 text-amber-600' :
            'bg-warm-100 text-gray-700'
          }`}>
            {formatTime(timeLeft)}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setVoiceEnabled(v => !v); if (isSpeaking) cancelSpeech() }}
              aria-label={voiceEnabled ? 'Mute client voice' : 'Enable client voice'}
              aria-pressed={!voiceEnabled}
              title={voiceEnabled ? 'Mute client voice' : 'Enable client voice'}
              className={`p-2 rounded-xl text-sm transition-colors ${voiceEnabled ? 'bg-crimson-50 text-crimson-600 hover:bg-crimson-100' : 'bg-warm-100 text-gray-400 hover:bg-warm-200'}`}
            >
              {voiceEnabled ? '🔊' : '🔇'}
            </button>
            <button
              onClick={() => setPanelOpen(o => !o)}
              aria-label={panelOpen ? 'Close reference panel' : 'Open reference panel'}
              aria-expanded={panelOpen}
              className="hidden lg:flex p-2 rounded-xl bg-warm-100 text-gray-500 hover:bg-warm-200 transition-colors text-sm"
              title="Reference panel"
            >
              📋
            </button>
            <button
              onClick={handleEnd}
              className="px-3 py-1.5 bg-crimson-600 hover:bg-crimson-700 text-white text-sm font-medium rounded-xl transition-colors shadow-soft"
            >
              {timesUp ? 'Time\'s Up →' : 'End Interview'}
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-warm-200 px-4 py-2.5 flex-shrink-0">
        <div className="max-w-5xl mx-auto">
          <PhaseIndicator currentPhase="interview" />
        </div>
      </div>

      {isSpeechSupported && showVoiceTip && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-3 flex-shrink-0">
          <div className="max-w-5xl mx-auto flex items-start justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <span className="text-blue-400 text-lg flex-shrink-0 mt-0.5">🎤</span>
              <div>
                <p className="text-sm font-medium text-blue-800">Voice input is available</p>
                <p className="text-xs text-blue-600 mt-0.5">Hold the mic button while you speak — your browser may ask for microphone permission the first time. Your words will appear as text so you can review and edit before sending.</p>
              </div>
            </div>
            <button
              onClick={() => { setShowVoiceTip(false); localStorage.setItem('swk-voice-tip-seen', '1') }}
              className="flex-shrink-0 text-blue-300 hover:text-blue-500 text-lg leading-none mt-0.5"
              aria-label="Dismiss"
            >×</button>
          </div>
        </div>
      )}

      {timesUp && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex-shrink-0">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <p className="text-amber-800 text-sm">Time is up. Finish your thought, then move to client feedback when you're ready.</p>
            <button onClick={handleEnd} className="flex-shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-xl transition-colors">
              Begin Feedback →
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex max-w-5xl mx-auto w-full overflow-hidden">
        {/* Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ClientAvatar client={client} size="lg" className="mb-4" />
                <p className="text-gray-500 text-sm max-w-xs">
                  {client.name} is waiting. Greet your client when you're ready to begin.
                </p>
                <p className="text-gray-400 text-xs mt-2">Timer starts with your first message.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} clientId={clientId} />
            ))}
            {isLoading && (
              <div role="status" aria-label={`${client.name} is responding`} className="flex items-end gap-2.5 justify-start">
                <ClientAvatar client={client} size="sm" />
                <div className="bg-white border border-warm-100 shadow-softer rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1.5 items-center h-4">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div role="alert" className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 border-t border-warm-200 bg-white px-4 py-3">
            <form onSubmit={handleSubmit} className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={e => { setInput(e.target.value); setIsVoiceInput(false) }}
                onKeyDown={handleKeyDown}
                placeholder={`Speak to ${client.name}...`}
                rows={2}
                className="flex-1 resize-none bg-warm-50 border border-warm-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-400 focus:border-transparent transition-all placeholder-gray-400"
                disabled={isLoading}
              />
              {isSpeechSupported && (
                <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                  <button
                    type="button"
                    onMouseDown={startListening}
                    onMouseUp={stopListening}
                    onTouchStart={startListening}
                    onTouchEnd={stopListening}
                    aria-label={isListening ? 'Release to stop recording' : 'Hold to record voice input'}
                    aria-pressed={isListening}
                    title="Hold to speak"
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all text-base ${
                      isListening
                        ? 'bg-red-500 text-white scale-110 ring-4 ring-red-100'
                        : 'bg-warm-100 text-gray-500 hover:bg-warm-200'
                    }`}
                  >
                    {isListening ? '⏹' : '🎤'}
                  </button>
                  {!isListening && (
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">Hold to speak</span>
                  )}
                </div>
              )}
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                className="flex-shrink-0 w-11 h-11 rounded-2xl bg-crimson-600 text-white flex items-center justify-center hover:bg-crimson-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-soft"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
            {isListening && (
              <p className="text-xs text-red-500 mt-1.5 ml-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
                Listening... release to stop
              </p>
            )}
            {!isListening && isVoiceInput && input.trim() && (
              <p className="text-xs text-crimson-600 mt-1.5 ml-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-crimson-400 inline-block" />
                Review your response above — edit if needed, then send when you're ready.
              </p>
            )}
          </div>
        </div>

        {/* Reference sidebar */}
        {panelOpen && (
          <div className="hidden lg:flex flex-col w-64 border-l border-warm-200 bg-white flex-shrink-0 overflow-y-auto">
            <div className="flex border-b border-warm-100">
              {['guide', 'consent', 'services'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setPanelTab(tab)}
                  className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${
                    panelTab === tab ? 'text-crimson-700 border-b-2 border-crimson-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab === 'guide' ? 'Guide' : tab === 'consent' ? 'Consent' : 'Services'}
                </button>
              ))}
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              {panelTab === 'guide' && (
                <ol className="space-y-3">
                  {INTERVIEW_GUIDE.map(item => (
                    <li key={item.id} className="flex gap-2 text-xs text-gray-600">
                      <span className="flex-shrink-0 font-bold text-crimson-600">{item.id}.</span>
                      <span className="leading-relaxed">{item.text}</span>
                    </li>
                  ))}
                </ol>
              )}
              {panelTab === 'consent' && (
                <pre className="whitespace-pre-wrap text-xs text-gray-600 font-sans leading-relaxed">{INFORMED_CONSENT_TEXT}</pre>
              )}
              {panelTab === 'services' && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Services</p>
                    <ul className="space-y-1">
                      {AGENCY_SERVICES.services.map(s => (
                        <li key={s} className="text-xs text-gray-600 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-crimson-400 flex-shrink-0" />{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Populations</p>
                    <ul className="space-y-1">
                      {AGENCY_SERVICES.populations.map(p => (
                        <li key={p} className="text-xs text-gray-600 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-crimson-400 flex-shrink-0" />{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
