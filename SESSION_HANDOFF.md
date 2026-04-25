# SWK Consent Sim — Session Handoff
*Last updated: April 25, 2026*

---

## Current State: Fully Functional + Live on Vercel

The app is live on Vercel with both API keys set. Working locally and in production.

---

## What's Working

- Full 4-client simulator: Michelle, David (Standard), Carlos, Aisha (Advanced)
- Live Claude API (claude-haiku-4-5-20251001) for interview, feedback, and assessment
- ElevenLabs TTS with per-client voice IDs, browser TTS fallback
- Web Speech API mic input (hold-to-speak)
- Kolb ELT flow: Interview → Client Feedback → Assessment → Try Again
- Session usage tracking: tokens and ElevenLabs chars displayed on Assessment screen
- Offline scripted mode still available — flip `USE_LIVE_LLM = false` in `src/lib/api.js`

---

## API Keys

Stored in `~/swk-consent-sim/.env` (not committed to GitHub). Two keys required:

```
ANTHROPIC_API_KEY=...
ELEVENLABS_API_KEY=...
```

Currently using personal keys. Swap to OUES keys when available — just edit `.env` locally or update Environment Variables in Vercel dashboard.

---

## GitHub

Repo: `https://github.com/dklosterman-24/swk-informed-consent-sim`
Branch: `main` — fully up to date as of this session.

---

## Running Locally

Two terminals required:

```bash
# Terminal 1 — API server
cd ~/swk-consent-sim
node server.js

# Terminal 2 — Frontend
cd ~/swk-consent-sim
npm run dev
```

Open `http://localhost:5173` (or whatever port Vite assigns if 5173 is taken).

If port 3001 is already in use: `lsof -ti :3001 | xargs kill -9`

---

## Deploying to Vercel

1. Go to vercel.com → Add New → Project → import `swk-informed-consent-sim`
2. Add environment variables: `ANTHROPIC_API_KEY` and `ELEVENLABS_API_KEY`
3. Deploy — Vercel handles the build automatically

---

## Usage Reporting

- **Per session:** Assessment screen shows token and ElevenLabs character counts
- **Anthropic billing:** https://console.anthropic.com/settings/usage
- **ElevenLabs billing:** https://elevenlabs.io/app/subscription

---

## Version 2 Upgrade Path (If POC Advances)

**Voice prosody assessment via Hume AI**
Current rubric evaluates word choice only — Claude sees transcribed text, not vocal delivery. A student can say the right words in a cold or dismissive tone and it won't be flagged.

If this moves past POC, the upgrade path is:
- Capture raw audio instead of just the Web Speech API transcript
- Send to Hume AI (purpose-built voice emotion/prosody analysis API)
- Feed tone, pacing, and emotional expression scores into the assessment rubric alongside the transcript

This would meaningfully close the gap between simulated and real assessment. Requires additional API integration and per-session cost. Agreed as deferred feature pending faculty buy-in.

---

## Next Steps (When Ready)

- [ ] Swap personal API keys for OUES keys (Anthropic + ElevenLabs) — edit `.env` locally and update Vercel env vars
- [ ] Share Vercel URL with peer / faculty for feedback round 2
- [ ] Consider upgrading model to `claude-sonnet-4-6` for richer responses (one line change in `api/chat.js`)
- [ ] Replace placeholder character avatars with real portrait photos (drop in `public/`, update `src/lib/clients.js`)
