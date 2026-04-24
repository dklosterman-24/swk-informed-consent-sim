export async function sendMessage(systemPrompt, conversationHistory) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system: systemPrompt,
      messages: conversationHistory,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || err.error || `Request failed: ${response.status}`)
  }

  const data = await response.json()
  return data.content
}

export function formatTranscriptForAssessment(messages) {
  return messages
    .map(m => `${m.role === 'user' ? 'STUDENT (Social Worker)' : 'CLIENT'}: ${m.content}`)
    .join('\n\n')
}
