// Local dev server — mirrors the Vercel serverless functions
// Run with: node server.js
import 'dotenv/config'
import http from 'http'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try { resolve(JSON.parse(body)) } catch (e) { reject(e) }
    })
  })
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }
  if (req.method !== 'POST')    { res.writeHead(405); res.end(); return }

  // ── /api/chat ──────────────────────────────────────────────────────────────
  if (req.url === '/api/chat') {
    try {
      const { messages, system } = await readBody(req)
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system,
        messages,
      })
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        content: response.content[0].text,
        usage: { input_tokens: response.usage.input_tokens, output_tokens: response.usage.output_tokens },
      }))
    } catch (err) {
      console.error('[/api/chat]', err.message)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: err.message }))
    }
    return
  }

  // ── /api/speak ─────────────────────────────────────────────────────────────
  if (req.url === '/api/speak') {
    try {
      const { text, voiceId } = await readBody(req)
      const elResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_turbo_v2',
            voice_settings: { stability: 0.5, similarity_boost: 0.75 },
          }),
        }
      )
      if (!elResponse.ok) {
        const detail = await elResponse.text()
        console.error('[/api/speak] ElevenLabs error:', detail)
        res.writeHead(elResponse.status, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'ElevenLabs error', detail }))
        return
      }
      const audioBuffer = Buffer.from(await elResponse.arrayBuffer())
      res.writeHead(200, { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' })
      res.end(audioBuffer)
    } catch (err) {
      console.error('[/api/speak]', err.message)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: err.message }))
    }
    return
  }

  res.writeHead(404)
  res.end(JSON.stringify({ error: 'Not found' }))
})

const PORT = 3001
server.listen(PORT, () => {
  console.log(`Dev API server running on http://localhost:${PORT}`)
  console.log(`  Claude:     ${process.env.ANTHROPIC_API_KEY ? '✓ key found' : '✗ ANTHROPIC_API_KEY missing'}`)
  console.log(`  ElevenLabs: ${process.env.ELEVENLABS_API_KEY ? '✓ key found' : '✗ ELEVENLABS_API_KEY missing'}`)
})
