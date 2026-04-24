// Vercel serverless function — Claude API proxy
// Upgrade path: swap model name or add streaming support here
import Anthropic from '@anthropic-ai/sdk'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages, system } = req.body

  if (!messages || !system) {
    return res.status(400).json({ error: 'Missing messages or system prompt' })
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const response = await client.messages.create({
      // Swap to 'claude-sonnet-4-6' or 'claude-opus-4-7' when upgrading
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system,
      messages,
    })
    return res.status(200).json({ content: response.content[0].text })
  } catch (err) {
    console.error('Claude API error:', err)
    return res.status(500).json({ error: 'LLM request failed', detail: err.message })
  }
}
