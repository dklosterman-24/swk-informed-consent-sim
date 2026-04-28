# SWK Consent Sim — Session Handoff
*Last updated: April 28, 2026*

---

## Current State: Fully Functional + Live on Vercel

The app is live on Vercel with both API keys set. Working locally and in production. Context bleed bug resolved — all four clients now have fully distinct narratives.

---

## What's Working

- Full 4-client simulator: Michelle, David (Standard), Carlos, Aisha (Advanced)
- Live Claude API (claude-haiku-4-5-20251001) for interview, feedback, and assessment
- ElevenLabs TTS with per-client voice IDs, browser TTS fallback
- Web Speech API mic input (hold-to-speak) with voice tip banner and post-recording nudge
- Kolb ELT flow: Interview → Client Feedback → Assessment → Try Again
- Session usage tracking: tokens and ElevenLabs chars displayed on Assessment screen
- OU branding: Oklahoma Crimson palette, Barlow/Barlow Condensed fonts, OU Online logo
- Photographic client avatars (Michelle.png, David.png, Carlos.png, Aisha.jpeg)
- Reference panel open by default on Interview screen
- Feedback phase grounded in actual interview transcript — skipped steps are called out
- Offline scripted mode still available — flip `USE_LIVE_LLM = false` in `src/lib/api.js`

---

## Context Bleed Fix (Completed This Session)

**Problem:** `buildClientSystemPrompt` in `src/lib/prompts.js` had Michelle and David's college student backstory hardcoded for all clients. Carlos and Aisha were answering as if they were 22-year-old students sleeping in cars.

**Fix:** Added four structured fields to every client profile in `src/lib/clients.js`:
- `opening` — one-sentence scene setter
- `backgroundBullets` — array of 8–10 client-specific background facts
- `emotionalState` — behavioral description for Claude
- `consentBehavior` — how this specific client responds to the consent form

Updated `buildClientSystemPrompt` to use these fields dynamically — no hardcoded content remains.

Committed and pushed to GitHub (`main`). Vercel auto-deployed.

---

## Documentation Added This Session

`TECHNICAL_HANDOFF.md` — committed to repo root (renders in GitHub). Also exported as:

`Client_Engagement_Simulator_Technical_Handoff.docx` — located at `~/swk-consent-sim/`. Share with stakeholders directly.

Document covers:
- Theoretical foundation (Kolb, Ericsson, Edmondson, NASW)
- Full application architecture and AI prompt design
- LLMs used in construction (Claude Sonnet 4.6 via Claude Code) vs. in production (Haiku)
- Cost estimates, deployment, transfer instructions, maintenance guide
- V2 feature table with complexity ratings

---

## API Keys

Stored in `~/swk-consent-sim/.env` (not committed to GitHub). Two keys required:

```
ANTHROPIC_API_KEY=...
ELEVENLABS_API_KEY=...
```

Currently using personal keys. Swap to OUES keys when available — edit `.env` locally and update Environment Variables in Vercel dashboard, then redeploy.

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

Push to `main` → Vercel auto-deploys. No manual steps needed.

To set up fresh on a new Vercel account:
1. Import `swk-informed-consent-sim` from GitHub
2. Add `ANTHROPIC_API_KEY` and `ELEVENLABS_API_KEY` in Environment Variables
3. Deploy

---

## Usage Reporting

- **Per session:** Assessment screen shows token and ElevenLabs character counts
- **Anthropic billing:** https://console.anthropic.com/settings/usage
- **ElevenLabs billing:** https://elevenlabs.io/app/subscription

---

## Version 2 Upgrade Path (If POC Advances)

Prioritized feature list (from Technical Handoff doc):

| Feature | Complexity |
|---|---|
| LMS integration (Canvas grade passback) | High |
| Session persistence / transcript storage | Medium |
| Voice prosody analysis (Hume AI) | High |
| Student vocal tone as rubric dimension | Medium |
| Instructor dashboard | Medium |
| Expanded client library | Low per client |
| Multilingual / Spanish-speaking scenario | Medium |

**Model upgrade** (easiest win): change one line in `api/chat.js` to `claude-sonnet-4-6` for noticeably richer client responses.

---

## Next Steps (When Ready)

- [ ] Swap personal API keys for OUES keys (Anthropic + ElevenLabs)
- [ ] Share Vercel URL and Word doc with faculty / stakeholders for feedback
- [ ] Consider model upgrade to `claude-sonnet-4-6` — one line in `api/chat.js`
- [ ] Gather feedback from peer and faculty before deciding on V2 scope
