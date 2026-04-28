import { useState, useEffect } from 'react'
import { CLIENTS, CLIENT_COLORS } from '../lib/clients.js'
import { generateAssessment, getSessionUsage, USE_LIVE_LLM, USE_ELEVENLABS } from '../lib/api.js'
import { PhaseIndicator } from './SetupScreen.jsx'
import ClientAvatar from './ClientAvatar.jsx'

const LEVEL_STYLES = {
  'Excellent':     'bg-green-100 text-green-800',
  'Proficient':    'bg-crimson-100 text-crimson-800',
  'Developing':    'bg-amber-100 text-amber-800',
  'Not Observed':  'bg-gray-100 text-gray-500',
  'Insufficient':  'bg-red-100 text-red-700',
}

function AssessmentContent({ text }) {
  const lines = text.split('\n')
  const elements = []
  let key = 0
  let inList = false

  for (const line of lines) {
    if (line.startsWith('## ')) {
      inList = false
      elements.push(<h2 key={key++} className="text-xl font-bold text-gray-800 mt-6 mb-3 first:mt-0">{line.slice(3)}</h2>)
    } else if (line.startsWith('### ')) {
      inList = false
      elements.push(<h3 key={key++} className="text-sm font-bold text-gray-500 uppercase tracking-wide mt-5 mb-2">{line.slice(4)}</h3>)
    } else if (line.startsWith('**') && line.includes('** —')) {
      inList = false
      const boldEnd = line.indexOf('** —')
      const title = line.slice(2, boldEnd)
      const rest  = line.slice(boldEnd + 4).trim()
      const levelEntry = Object.keys(LEVEL_STYLES).find(k => rest.includes(k))
      const levelClass = levelEntry ? LEVEL_STYLES[levelEntry] : 'bg-gray-100 text-gray-500'
      elements.push(
        <div key={key++} className="flex items-center gap-3 mt-4 mb-1">
          <p className="font-semibold text-gray-800 flex-1 text-sm">{title}</p>
          {rest && <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${levelClass}`}>{rest}</span>}
        </div>
      )
    } else if (line.startsWith('- ')) {
      if (!inList) { inList = true }
      elements.push(
        <li key={key++} className="ml-4 text-gray-600 text-sm leading-relaxed list-disc">{line.slice(2)}</li>
      )
    } else if (line.startsWith('---')) {
      inList = false
      elements.push(<hr key={key++} className="my-5 border-warm-200" />)
    } else if (line.trim()) {
      inList = false
      elements.push(<p key={key++} className="text-gray-600 text-sm leading-relaxed mt-1.5">{line}</p>)
    }
  }

  return <div>{elements}</div>
}

export default function AssessmentScreen({ clientId, interviewMessages, feedbackMessages, onRestart }) {
  const client = CLIENTS[clientId]
  const colors = CLIENT_COLORS[client.color]

  const [assessmentText, setAssessmentText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [usage, setUsage] = useState(null)

  useEffect(() => {
    generateAssessment(null, interviewMessages, client.name)
      .then(text => {
        setAssessmentText(text)
        setUsage(getSessionUsage())
      })
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      <header className="bg-white border-b border-warm-200 px-4 py-3 flex-shrink-0 shadow-softer">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <ClientAvatar client={client} size="md" />
          <div>
            <p className="font-semibold text-gray-800">Session Assessment — {client.name}</p>
            <p className="text-xs text-gray-400">Based on your interview transcript</p>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-warm-200 px-4 py-2.5 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <PhaseIndicator currentPhase="assessment" />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">

          {isLoading && (
            <div className="bg-white rounded-3xl shadow-soft p-10 text-center">
              <div className={`w-14 h-14 rounded-full ${colors.bg} flex items-center justify-center mx-auto mb-4`}>
                <div className={`w-6 h-6 border-2 border-current ${colors.text} border-t-transparent rounded-full animate-spin`} />
              </div>
              <p className="text-gray-700 font-medium">Reviewing your session...</p>
              <p className="text-gray-400 text-sm mt-1">Analyzing transcript against rubric criteria</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-red-700">
              <p className="font-medium text-sm">Assessment could not be generated.</p>
              <p className="text-sm mt-1 text-red-600">{error}</p>
            </div>
          )}

          {!isLoading && !error && assessmentText && (
            <>
              {/* Session stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: interviewMessages.filter(m => m.role === 'user').length,      label: 'Your responses' },
                  { value: interviewMessages.filter(m => m.role === 'assistant').length, label: `${client.name}'s responses` },
                  { value: feedbackMessages.filter(m => m.role === 'assistant').length,  label: 'Feedback exchanges' },
                ].map(({ value, label }) => (
                  <div key={label} className="bg-white rounded-2xl shadow-softer border border-warm-100 p-4 text-center">
                    <p className={`text-2xl font-bold ${colors.text}`}>{value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Usage stats */}
              {USE_LIVE_LLM && usage && (
                <div className="bg-white rounded-2xl shadow-softer border border-warm-100 px-5 py-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Session API Usage</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">{usage.inputTokens.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">input tokens</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">{usage.outputTokens.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">output tokens</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">{usage.turns}</p>
                      <p className="text-xs text-gray-400">API calls</p>
                    </div>
                  </div>
                  {USE_ELEVENLABS && (
                    <div className="mt-3 pt-3 border-t border-warm-100 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{usage.elChars.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">ElevenLabs characters</p>
                      </div>
                      <p className="text-xs text-gray-300 text-right max-w-[160px]">Check billing at console.anthropic.com and elevenlabs.io</p>
                    </div>
                  )}
                </div>
              )}

              {/* Main assessment */}
              <div className="bg-white rounded-3xl shadow-soft p-6">
                <AssessmentContent text={assessmentText} />
              </div>

              {/* Reflection prompts */}
              <div className={`${colors.bg} rounded-2xl p-5 border ${colors.border}`}>
                <p className={`text-sm font-semibold ${colors.text} mb-3`}>Before your next attempt, reflect:</p>
                <ol className="space-y-2">
                  {[
                    `What one thing would you do differently in the first two minutes?`,
                    `Where did you feel most confident, and where did you feel stuck?`,
                    `How did ${client.name}'s responses change based on how you engaged?`,
                  ].map((q, i) => (
                    <li key={i} className={`text-sm ${colors.text} flex items-start gap-2 opacity-90`}>
                      <span className="font-bold flex-shrink-0 mt-0.5">{i + 1}.</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onRestart}
              className="flex-1 py-3.5 bg-crimson-600 text-white font-medium rounded-2xl hover:bg-crimson-700 transition-all shadow-soft hover:shadow-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => window.print()}
              className="px-5 py-3.5 border border-warm-200 text-gray-600 font-medium rounded-2xl hover:bg-warm-100 transition-colors"
            >
              Print / Save
            </button>
          </div>

        </div>
      </main>
    </div>
  )
}
