import { getScriptedResponse, getScriptedFeedback, getScriptedAssessment } from './scriptedResponses.js'

// Set to true to use live Claude API (requires backend + API key)
// Set to false for fully offline scripted mode (POC default)
export const USE_LIVE_LLM = false

export async function sendChatMessage(systemPrompt, conversationHistory, clientName) {
  if (!USE_LIVE_LLM) {
    const lastUserMessage = [...conversationHistory].reverse().find(m => m.role === 'user')
    const text = lastUserMessage?.content || ''
    await delay(600 + Math.random() * 600) // realistic response pause
    return getScriptedResponse(text, clientName, conversationHistory.length)
  }

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system: systemPrompt, messages: conversationHistory }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || err.error || `Request failed: ${response.status}`)
  }

  return (await response.json()).content
}

export async function sendFeedbackMessage(systemPrompt, conversationHistory, clientName, isOpening) {
  if (!USE_LIVE_LLM) {
    await delay(700 + Math.random() * 500)
    return getScriptedFeedback(clientName, isOpening)
  }

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system: systemPrompt, messages: conversationHistory }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || err.error || `Request failed: ${response.status}`)
  }

  return (await response.json()).content
}

export async function generateAssessment(systemPrompt, interviewMessages, clientName) {
  if (!USE_LIVE_LLM) {
    await delay(1500 + Math.random() * 1000) // simulate analysis time
    return getScriptedAssessment(clientName, interviewMessages)
  }

  const transcript = formatTranscriptForAssessment(interviewMessages)
  const prompt = buildAssessmentSystemPrompt(clientName, transcript)

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system: prompt,
      messages: [{ role: 'user', content: 'Please evaluate this interview.' }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || err.error || `Request failed: ${response.status}`)
  }

  return (await response.json()).content
}

export function formatTranscriptForAssessment(messages) {
  return messages
    .map(m => `${m.role === 'user' ? 'STUDENT (Social Worker)' : 'CLIENT'}: ${m.content}`)
    .join('\n\n')
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
