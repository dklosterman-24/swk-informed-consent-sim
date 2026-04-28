# Client Engagement Practice Simulator
## Technical Handoff Document
### OU Online — Social Work Program

**Document prepared for:** SWK3103 / SWK2113 Stakeholders  
**Prepared by:** Daniel Klosterman, Learning Experience Designer  
**Date:** April 2026  
**Application URL:** https://swk-informed-consent-sim.vercel.app  
**Source Repository:** https://github.com/dklosterman-24/swk-informed-consent-sim

---

## 1. Purpose and Background

### What This Application Does

The Client Engagement Practice Simulator is a web-based training tool for social work students. It provides a low-stakes, repeatable environment in which students can practice the initial client engagement interview — a foundational skill required in field placements and professional practice. Students conduct a structured, timed interview with an AI-simulated client, receive character-driven feedback from the client's perspective, and receive a competency rubric assessment from an expert evaluator persona.

The tool was built as a proof-of-concept for the OUES Showcase (April 2026) and is designed for integration into SWK3103 (Generalist Practice with Individuals and Families) and SWK2113.

### The Problem It Solves

Traditional social work pedagogy relies on in-class role play and faculty-supervised practice. Both have significant limitations: role-play partners are not consistently challenging, faculty supervision is resource-intensive, and students rarely get formative feedback before field placement. Simulation-based learning addresses all three constraints by providing on-demand, consistent, and detailed feedback at any hour without consuming instructor time.

---

## 2. Theoretical Foundation

The design of this simulator draws on three intersecting bodies of scholarship.

### 2.1 Experiential Learning Theory

David Kolb's Experiential Learning Cycle (1984) frames learning as a four-stage process: concrete experience, reflective observation, abstract conceptualization, and active experimentation. The simulator is designed to move students through this cycle within a single session. The interview is the concrete experience. The client reflection phase (where the AI client speaks candidly about how the interaction felt) is structured reflective observation. The rubric assessment provides the abstract conceptualization — naming what happened against professional standards. The student can then immediately restart and experiment with a different approach.

This cycle, which might take a week in a traditional practicum, compresses into approximately 30 minutes.

### 2.2 Deliberate Practice and Formative Feedback

Anders Ericsson's research on expertise development (1993, 2006) identifies deliberate practice — repeated effort with immediate, specific, corrective feedback on performance gaps — as the primary mechanism by which professionals develop advanced skill. Most training environments fail this standard because feedback is delayed, general, or absent.

The simulator delivers three distinct layers of feedback on every session:

- **In-session behavioral response**: The AI client responds authentically to the quality of the student's engagement, warming or withdrawing based on tone, pacing, and empathy. This is immediate, experiential, and behavioral.
- **Client reflection**: After the interview, the client offers first-person perspective on what felt good, what felt rushed, and what was missed. This models the kind of reflective dialogue clients rarely have with practitioners.
- **Expert rubric assessment**: A nine-criterion competency rubric — grounded in social work best practice — provides specific, actionable observations tied to transcript evidence. It does not produce a grade; it produces a developmental map.

### 2.3 Psychological Safety in Simulation

Amy Edmondson's work on psychological safety (1999) and its application to simulation-based learning (Rudolph, Simon, et al., 2007) establishes that learners must feel safe to fail in order to take the risks that produce learning. The simulator is explicitly designed around this principle. Students are told before the interview that there is no penalty for mistakes. The interface language is warm and developmental, not evaluative. The client responds to poor technique with disengagement rather than hostility, which mirrors real-world dynamics without being punishing.

The four client profiles vary in complexity (standard vs. advanced) to allow students to calibrate their entry point — building confidence in a standard scenario before attempting a case involving prior incarceration, domestic violence, or other sensitive presenting circumstances.

### 2.4 Informed Consent as a Core Practice Skill

Informed consent is not merely a procedural compliance step; it is the first substantive act of the client-worker relationship. How a practitioner explains consent communicates whether they view the client as a partner or a subject. The NASW Code of Ethics (1.03) and standard field practice frameworks treat consent delivery, plain-language explanation of confidentiality limits, and responsive handling of client questions as core competencies. The simulator treats informed consent not as an administrative checkbox but as a relational skill — one that clients notice, respond to, and reflect on.

---

## 3. Application Architecture

### 3.1 Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend framework | React 18 (Vite) | UI rendering and state management |
| Styling | Tailwind CSS | Responsive layout, OU brand palette |
| LLM API | Anthropic Claude (claude-haiku-4-5-20251001) | Client simulation and assessment |
| Text-to-speech | ElevenLabs (eleven_turbo_v2) | Per-client voice synthesis |
| Speech-to-text | Web Speech API (browser-native) | Microphone input for student speech |
| Hosting | Vercel | Serverless deployment and CDN |
| Source control | GitHub | Version control and CI/CD trigger |

### 3.2 Application Flow

The application moves students through four sequential phases, each managed by a corresponding screen component:

**Phase 1 — Preparation (SetupScreen)**  
The student selects a client (standard or advanced), reads a case brief summarizing the client's background, reviews the interview guide (eight structured steps), and the informed consent form they will need to explain. No AI calls are made during this phase.

**Phase 2 — Interview (InterviewScreen)**  
A 20-minute timed conversation. Each message the student sends is passed to Claude's API with a client-specific system prompt that defines the client's background, emotional state, behavioral rules, and the informed consent text. Claude responds as the client. If ElevenLabs is enabled, the client's response is synthesized in the client's assigned voice. Students may also input via microphone using the browser's Web Speech API. A collapsible reference sidebar gives access to the interview guide, consent form, and agency services during the interview.

**Phase 3 — Reflection (FeedbackScreen)**  
A 5-minute conversation in which the same client character speaks candidly about the interview experience. Claude receives the complete interview transcript as context and is instructed to give honest, specific, first-person feedback — naming what was missed, not pretending it happened. The student can ask follow-up questions.

**Phase 4 — Assessment (AssessmentScreen)**  
Claude receives the full interview transcript and evaluates it against a nine-criterion rubric: greeting and introduction, opening and story invitation, consent delivery and explanation, consent questions and verbal confirmation, agency services explanation, goodness-of-fit exploration, presenting problem elicitation, open questioning skills, and reflective listening. Each criterion receives a rating (Excellent, Proficient, Developing, or Not Observed) with a specific transcript-referenced observation. A strengths summary and areas-for-growth section are generated. The student may download the assessment as a PDF.

### 3.3 AI Prompt Architecture

Each phase uses a distinct system prompt:

- **Interview prompt** (`buildClientSystemPrompt`): Defines who the client is — their specific backstory, emotional state, behavioral rules, and access to the consent form and agency services list. Each of the four clients has a fully distinct prompt so there is no background contamination across characters.

- **Feedback prompt** (`buildFeedbackSystemPrompt`): Instructs the client to stay in character but shift to reflective mode. Includes the complete interview transcript so the client can reference only what actually happened — including calling out steps that were skipped.

- **Assessment prompt** (`buildAssessmentPrompt`): Instructs an expert evaluator persona to apply the nine-criterion rubric to the transcript, producing a structured markdown report with specific examples.

### 3.4 API Proxy Architecture

API keys are never exposed to the browser. All Claude and ElevenLabs calls are routed through Vercel serverless functions:

- `/api/chat` — Accepts the system prompt and message history from the frontend, forwards to Claude, returns the response text and token usage.
- `/api/speak` — Accepts response text and a voice ID, forwards to ElevenLabs, streams back the audio buffer.

In local development, a Node.js Express server (`server.js`) mirrors both endpoints on port 3001. The Vite development server proxies `/api/*` requests to this local server, so the frontend code is identical in both environments.

### 3.5 Client Profiles

Four clients are currently configured:

| Client | Age | Tier | Presenting Issue | ElevenLabs Voice |
|---|---|---|---|---|
| Michelle | 22 | Standard | Student homelessness, housing and budgeting | Rachel |
| David | 22 | Standard | Student homelessness, housing and budgeting | Sam |
| Carlos | 54 | Advanced | Post-incarceration reentry, housing, employment | Adam |
| Aisha | 31 | Advanced | Domestic violence, shelter transition, safety | Domi |

---

## 4. LLMs Used

### 4.1 LLMs Used in Construction

This application was designed and built using **Claude Code** — Anthropic's agentic CLI tool — powered by **Claude Sonnet 4.6** (model ID: `claude-sonnet-4-6`). Claude Code was used for the full development lifecycle: architecture planning, component development, prompt engineering, debugging, Git commit history, and documentation. No external development agency or traditional coding was involved beyond instructional design direction from the project lead.

This represents an emerging model for rapid educational technology development: a learning designer with domain expertise directing an AI coding agent, rather than a traditional software development team.

### 4.2 LLMs Currently Running the Application

The application currently runs on **Claude Haiku** (model ID: `claude-haiku-4-5-20251001`), Anthropic's fastest and most cost-efficient model. Haiku was selected for proof-of-concept deployment because it is substantially cheaper per token while still producing natural, contextually appropriate client responses at the speed needed for real-time conversation.

The model is configured in a single line in `/api/chat.js`:

```
model: 'claude-haiku-4-5-20251001'
```

Upgrading to a more capable model — such as Claude Sonnet 4.6 for richer, more nuanced client responses — requires changing this one line.

**Text-to-speech** is powered by **ElevenLabs** (model: `eleven_turbo_v2`), a commercial voice synthesis platform. Each client has an assigned voice ID from ElevenLabs' voice library.

### 4.3 Estimated API Costs

Based on current Anthropic pricing (approximate; subject to change):

| Model | Input cost | Output cost | Typical session cost |
|---|---|---|---|
| Claude Haiku (current) | $0.80 / 1M tokens | $4.00 / 1M tokens | ~$0.01–0.03 |
| Claude Sonnet 4.6 (upgrade path) | $3.00 / 1M tokens | $15.00 / 1M tokens | ~$0.05–0.15 |

ElevenLabs charges per character synthesized. A full 20-minute interview with voice enabled consumes approximately 2,000–4,000 characters, which at current pricing (Starter plan) costs a fraction of a cent per session.

Usage monitoring is available at:
- Anthropic: https://console.anthropic.com/settings/usage
- ElevenLabs: https://elevenlabs.io/app/subscription

---

## 5. Deployment and Infrastructure

### 5.1 Current Deployment

The application is deployed on **Vercel** (free tier) and connected to the GitHub repository. Every push to the `main` branch triggers an automatic deployment. The live URL is publicly accessible without authentication.

Environment variables (API keys) are stored securely in Vercel's environment variable store and are never committed to the repository.

### 5.2 Repository Structure

```
swk-consent-sim/
├── api/
│   ├── chat.js          — Serverless function: Claude API proxy
│   └── speak.js         — Serverless function: ElevenLabs TTS proxy
├── public/
│   ├── Michelle.png     — Client avatar images
│   ├── David.png
│   ├── Carlos.png
│   ├── Aisha.jpeg
│   └── OU_online_logo.png
├── src/
│   ├── components/
│   │   ├── SetupScreen.jsx       — Phase 1: client selection and briefing
│   │   ├── InterviewScreen.jsx   — Phase 2: timed interview
│   │   ├── FeedbackScreen.jsx    — Phase 3: client reflection
│   │   ├── AssessmentScreen.jsx  — Phase 4: rubric evaluation
│   │   ├── ClientAvatar.jsx      — Shared avatar component
│   │   └── MessageBubble.jsx     — Shared chat bubble component
│   ├── hooks/
│   │   ├── useSpeechRecognition.js   — Browser STT wrapper
│   │   └── useSpeechSynthesis.js     — ElevenLabs / browser TTS wrapper
│   ├── lib/
│   │   ├── clients.js    — All client profiles and static content
│   │   ├── prompts.js    — System prompt builders for each phase
│   │   └── api.js        — API call functions and usage tracking
│   └── App.jsx           — Top-level routing and phase state
├── server.js             — Local dev API server (mirrors Vercel functions)
├── vercel.json           — Vercel deployment configuration
└── index.html            — Entry point with Google Fonts and metadata
```

---

## 6. Transferring Ownership

### 6.1 GitHub Repository Transfer

To transfer the repository to an OU-owned GitHub account:

1. The current owner goes to: GitHub repository → Settings → Danger Zone → Transfer ownership
2. Enter the destination GitHub username or organization
3. The new owner accepts the transfer via email invitation
4. Update the Vercel project to connect to the new repository location (Vercel → Project Settings → Git)

### 6.2 Replacing API Keys

Both API keys live in two places: the Vercel environment and the local `.env` file (for development). Neither is committed to the repository.

**To replace the Anthropic key:**
1. Vercel dashboard → Project → Settings → Environment Variables
2. Edit `ANTHROPIC_API_KEY` → paste new key → Save
3. Redeploy (Vercel → Deployments → Redeploy latest)

**To replace the ElevenLabs key:**
1. Same process for `ELEVENLABS_API_KEY`

**For local development**, update the `.env` file at the project root:
```
ANTHROPIC_API_KEY=your-key-here
ELEVENLABS_API_KEY=your-key-here
```

### 6.3 Vercel Project Transfer

If transferring the Vercel project itself to an institutional account:
1. Vercel dashboard → Project Settings → Transfer Project
2. Select the destination team or account
3. Re-add environment variables in the new account (they do not transfer for security reasons)

---

## 7. Maintaining and Updating the Application

### 7.1 Adding or Modifying Clients

All client content lives in a single file: `src/lib/clients.js`. To add a new client:

1. Add a new entry to the `CLIENTS` object with the required fields:
   - `id`, `name`, `age`, `pronouns`, `label`, `color`, `tier`
   - `voiceId` — an ElevenLabs voice ID from the account's voice library
   - `avatar` — path to an image in `public/`
   - `summary` — paragraph narrative shown on the case brief screen
   - `opening` — single sentence describing who the client is and the context
   - `backgroundBullets` — array of background facts (8–10 items)
   - `emotionalState` — paragraph describing affect and behavioral cues
   - `consentBehavior` — instruction for how the client responds to the consent form

2. Add the avatar image to `public/`

3. Add a color entry to `CLIENT_COLORS` if using a new Tailwind color

No other files need to be changed to support a new client.

### 7.2 Modifying the Assessment Rubric

The rubric lives in `src/lib/prompts.js` in the `buildAssessmentPrompt` function. Criteria can be added, removed, or reworded by editing the `RUBRIC CRITERIA` section of the prompt string. The response format section controls how Claude structures its output — update both if adding new criteria.

### 7.3 Upgrading the AI Model

To upgrade from Haiku to Sonnet or Opus:

1. Open `api/chat.js`
2. Change the model string:
   - `claude-haiku-4-5-20251001` → `claude-sonnet-4-6` (recommended next step)
   - `claude-sonnet-4-6` → `claude-opus-4-7` (highest capability, highest cost)
3. Commit and push — Vercel redeploys automatically

### 7.4 Adding Courses or Scenarios

The interview guide (`INTERVIEW_GUIDE`) and informed consent text (`INFORMED_CONSENT_TEXT`) are defined in `clients.js` and are currently shared across all clients. If different courses require different guides or consent forms, these can be moved to per-client fields following the same pattern as `backgroundBullets`.

### 7.5 Running Locally

Prerequisites: Node.js 18+, a `.env` file with both API keys.

```
cd swk-consent-sim
npm install
node server.js        # in one terminal — starts API proxy on port 3001
npm run dev           # in another terminal — starts frontend on port 5173
```

Open `http://localhost:5173` in a browser.

---

## 8. Known Limitations and Version 2 Considerations

### 8.1 Current Limitations

- **No authentication**: The application is publicly accessible. Any person with the URL can use it. If institutional tracking of student usage is required, authentication would need to be added.
- **No persistence**: Sessions are not saved. Assessments can be downloaded as PDF by the student, but there is no database backing transcript storage or institutional reporting.
- **Voice prosody**: ElevenLabs produces natural voice but does not model emotional affect (e.g., a hesitant pause, a cracking voice). The client's distress is conveyed through word choice, not tone.
- **Text-only student input assessment**: The rubric evaluates what the student writes, not how they say it. Vocal tone, cadence, and warmth — which are real components of client engagement — are not measured.

### 8.2 Version 2 Upgrade Path

The following enhancements have been identified for a production version:

| Feature | Rationale | Complexity |
|---|---|---|
| LMS integration (Canvas) | Grade passback, enrollment-gated access, institutional analytics | High |
| Session persistence and transcript storage | Faculty review, longitudinal progress tracking | Medium |
| Voice prosody analysis | Evaluate student's vocal tone using Hume AI or similar | High |
| Student voice rubric dimension | Add tone/cadence/pacing as a 10th criterion | Medium |
| Instructor dashboard | View student attempts, flag for review, export reports | Medium |
| Expanded client library | Additional presenting circumstances (grief, substance use, etc.) | Low per client |
| Multilingual support | Spanish-speaking client scenario; dual-language practice | Medium |

---

## 9. Contact and Support

**Application Developer / Instructional Design Lead:**  
Daniel Klosterman  
dankloster@gmail.com

**Source Code:** https://github.com/dklosterman-24/swk-informed-consent-sim  
**Live Application:** https://swk-informed-consent-sim.vercel.app  
**Anthropic Usage Console:** https://console.anthropic.com/settings/usage  
**ElevenLabs Usage Console:** https://elevenlabs.io/app/subscription

---

*This document reflects the state of the application as of April 2026. The codebase is version-controlled and all changes are traceable through the GitHub commit history.*
