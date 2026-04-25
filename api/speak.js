// Vercel serverless function — ElevenLabs TTS proxy
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { text, voiceId } = req.body
  if (!text || !voiceId) {
    return res.status(400).json({ error: 'Missing text or voiceId' })
  }

  const response = await fetch(
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

  if (!response.ok) {
    const err = await response.text()
    return res.status(response.status).json({ error: 'ElevenLabs error', detail: err })
  }

  const audioBuffer = await response.arrayBuffer()
  res.setHeader('Content-Type', 'audio/mpeg')
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).send(Buffer.from(audioBuffer))
}
