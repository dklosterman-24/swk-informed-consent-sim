import { useState, useEffect } from 'react'
import { CLIENTS } from '../lib/clients.js'
import { buildAssessmentPrompt } from '../lib/prompts.js'
import { sendMessage, formatTranscriptForAssessment } from '../lib/api.js'
import { PhaseIndicator } from './SetupScreen.jsx'

// Renders the markdown-formatted assessment response
function AssessmentContent({ text }) {
  const lines = text.split('\n')
  const elements = []
  let key = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('## ')) {
      elements.push(<h2 key={key++} className="text-xl font-bold text-navy-700 mt-6 mb-3">{line.slice(3)}</h2>)
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={key++} className="text-base font-semibold text-gray-800 mt-5 mb-2 border-b border-gray-100 pb-1">{line.slice(4)}</h3>)
    } else if (line.startsWith('**') && line.includes('** —')) {
      // Criterion lines: **N. Title** — Level
      const [titlePart, rest] = line.split('** —')
      const title = titlePart.replace('**', '')
      const level = rest?.trim() || ''
      const levelColors = {
        'Excellent': 'bg-green-100 text-green-800',
        'Proficient': 'bg-blue-100 text-blue-800',
        'Developing': 'bg-amber-100 text-amber-800',
        'Not Observed': 'bg-gray-100 text-gray-600',
      }
      const colorClass = Object.entries(levelColors).find(([k]) => level.includes(k))?.[1] || 'bg-gray-100 text-gray-600'
      elements.push(
        <div key={key++} className="flex items-start gap-3 mt-4">
          <p className="font-semibold text-gray-800 flex-1">{title}</p>
          {level && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${colorClass}`}>{level}</span>}
        </div>
      )
    } else if (line.startsWith('- ')) {
      elements.push(
        <li key={key++} className="ml-4 text-gray-700 text-sm leading-relaxed list-disc">
          {line.slice(2)}
        </li>
      )
    } else if (line.startsWith('---')) {
      elements.push(<hr key={key++} className="my-4 border-gray-200" />)
    } else if (line.trim()) {
      elements.push(<p key={key++} className="text-gray-700 text-sm leading-relaxed mt-1">{line}</p>)
    }
  }

  return <div>{elements}</div>
}

export default function AssessmentScreen({ clientId, interviewMessages, feedbackMessages, onRestart }) {
  const client = CLIENTS[clientId]

  const [assessmentText, setAssessmentText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const transcript = formatTranscriptForAssessment(interviewMessages)
    const prompt = buildAssessmentPrompt(client.name, transcript)

    // Assessment uses a one-shot system prompt with the transcript embedded
    sendMessage(prompt, [{ role: 'user', content: 'Please evaluate this interview.' }])
      .then(text => setAssessmentText(text))
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-indigo-800 text-white px-4 py-3 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <p className="text-indigo-200 text-xs font-medium uppercase tracking-wide">Performance Assessment</p>
          <h1 className="text-lg font-semibold">Session with {client.name}</h1>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <PhaseIndicator currentPhase="assessment" />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">

          {isLoading && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-gray-600 font-medium">Reviewing your session...</p>
              <p className="text-gray-400 text-sm mt-1">Analyzing the full transcript against rubric criteria</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-4 text-red-700">
              <p className="font-medium">Assessment could not be generated.</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {!isLoading && !error && assessmentText && (
            <>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <AssessmentContent text={assessmentText} />
              </div>

              {/* Session stats */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <p className="text-2xl font-bold text-navy-700">
                    {interviewMessages.filter(m => m.role === 'user').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Your responses</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <p className="text-2xl font-bold text-navy-700">
                    {interviewMessages.filter(m => m.role === 'assistant').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{client.name}'s responses</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <p className="text-2xl font-bold text-navy-700">
                    {feedbackMessages.filter(m => m.role === 'assistant').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Feedback exchanges</p>
                </div>
              </div>

              {/* Kolb reflection prompt */}
              <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                <p className="text-sm font-semibold text-indigo-800 mb-2">Before your next attempt, reflect:</p>
                <ul className="space-y-1.5">
                  <li className="text-sm text-indigo-700 flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0">1.</span>
                    What one thing would you do differently in the first 2 minutes?
                  </li>
                  <li className="text-sm text-indigo-700 flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0">2.</span>
                    Where did you feel most confident, and where did you feel stuck?
                  </li>
                  <li className="text-sm text-indigo-700 flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0">3.</span>
                    How did {client.name}'s responses change based on your approach?
                  </li>
                </ul>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onRestart}
              className="flex-1 py-3 bg-navy-700 text-white font-medium rounded-lg hover:bg-navy-800 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.print()}
              className="px-5 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Print / Save
            </button>
          </div>

        </div>
      </main>
    </div>
  )
}
