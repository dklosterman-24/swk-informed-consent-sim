import { getScriptedResponse, getScriptedFeedback, getScriptedAssessment } from './scriptedResponses.js'

export const USE_LIVE_LLM    = true  // flip to false to use scripted offline mode
export const USE_ELEVENLABS  = true  // flip to false to use browser TTS

// ─── Session usage tracking ───────────────────────────────────────────────────
let _usage = { inputTokens: 0, outputTokens: 0, elChars: 0, turns: 0 }
export const getSessionUsage  = () => ({ ..._usage })
export const resetSessionUsage = () => { _usage = { inputTokens: 0, outputTokens: 0, elChars: 0, turns: 0 } }

function _trackClaudeUsage(usage) {
  if (!usage) return
  _usage.inputTokens  += usage.input_tokens  || 0
  _usage.outputTokens += usage.output_tokens || 0
  _usage.turns++
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export async function sendChatMessage(systemPrompt, conversationHistory, clientId) {
  if (!USE_LIVE_LLM) {
    const lastUserMessage = [...conversationHistory].reverse().find(m => m.role === 'user')
    const text = lastUserMessage?.content || ''
    await delay(600 + Math.random() * 600)
    return getScriptedResponse(text, clientId)
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

  const data = await response.json()
  _trackClaudeUsage(data.usage)
  return data.content
}

export async function sendFeedbackMessage(systemPrompt, conversationHistory, clientId, isOpening) {
  if (!USE_LIVE_LLM) {
    await delay(700 + Math.random() * 500)
    return getScriptedFeedback(clientId, isOpening)
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

  const data = await response.json()
  _trackClaudeUsage(data.usage)
  return data.content
}

export async function generateAssessment(systemPrompt, interviewMessages, clientName) {
  if (!USE_LIVE_LLM) {
    await delay(1500 + Math.random() * 1000)
    return getScriptedAssessment(clientName, interviewMessages)
  }

  const transcript = formatTranscriptForAssessment(interviewMessages)
  const { buildAssessmentPrompt } = await import('./prompts.js')
  const prompt = buildAssessmentPrompt(clientName, transcript)

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

  const data = await response.json()
  _trackClaudeUsage(data.usage)
  return data.content
}

// ─── ElevenLabs TTS ───────────────────────────────────────────────────────────

export async function speakWithElevenLabs(text, voiceId) {
  _usage.elChars += text.length
  const response = await fetch('/api/speak', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voiceId }),
  })

  if (!response.ok) {
    throw new Error(`ElevenLabs request failed: ${response.status}`)
  }

  const blob = await response.blob()
  return URL.createObjectURL(blob)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatTranscriptForAssessment(messages) {
  return messages
    .map(m => `${m.role === 'user' ? 'STUDENT (Social Worker)' : 'CLIENT'}: ${m.content}`)
    .join('\n\n')
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
