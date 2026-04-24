// Scripted response engine — no LLM required.
// Detects the intent of the student's message and returns an appropriate
// in-character client response. Falls back to a generic "waiting" response.

// Keywords that signal each conversation stage
const INTENT_PATTERNS = [
  {
    intent: 'greeting',
    patterns: [/hello|hi |hey |good morning|good afternoon|welcome|my name is|i'm .*(social worker|here to|from)/i],
  },
  {
    intent: 'ask_name',
    patterns: [/your name|what('s| is) your name|may i (ask|get) your name|call you/i],
  },
  {
    intent: 'how_are_you',
    patterns: [/how are you|how('re| are) you doing|how do you feel|how has your/i],
  },
  {
    intent: 'how_can_i_help',
    patterns: [/how can i help|what brings you|what can i do for you|tell me what|why (did you|have you) come|what (are you|brought you)/i],
  },
  {
    intent: 'informed_consent',
    patterns: [/informed consent|consent form|confidential|privacy|sign|agree|services agreement|before we (begin|start|go further|continue)/i],
  },
  {
    intent: 'agency_services',
    patterns: [/services (we |this agency |salvat|offer|provid|availab)|what we (do|offer|provide)|agency (offer|provid|has)|food|groceries|utility|case management|disaster/i],
  },
  {
    intent: 'open_question_housing',
    patterns: [/tell me (more|about)|what happened|how did (that|this)|what led|what (was it|were the circumstances)|describe|share more|walk me through/i],
  },
  {
    intent: 'open_question_feelings',
    patterns: [/how (does that|do you) feel|what('s| is) that like|what are you (experiencing|going through)|that sounds/i],
  },
  {
    intent: 'ask_services_fit',
    patterns: [/which (of these|services)|what (here|of this|do you think) (might|could|would) (help|be useful|work)|useful to you|apply to (you|your situation)/i],
  },
  {
    intent: 'empathy_reflection',
    patterns: [/i (hear|understand|can see|imagine|sense)|it sounds like|it seems like|that must (be|have)|sounds (difficult|hard|tough|challenging|stressful)/i],
  },
  {
    intent: 'university_bill',
    patterns: [/university|tuition|bill|balance|school|college|drop out|enrollment/i],
  },
  {
    intent: 'housing',
    patterns: [/apartment|housing|living|shelter|car|where (are you|do you) (staying|living|sleep)|homeless/i],
  },
  {
    intent: 'work',
    patterns: [/work|job|employ|income|money|financial|fast.food|restaurant/i],
  },
  {
    intent: 'family',
    patterns: [/family|parents|relatives|support system|back home/i],
  },
]

function detectIntent(text) {
  const lower = text.toLowerCase()
  for (const { intent, patterns } of INTENT_PATTERNS) {
    if (patterns.some(p => p.test(lower))) return intent
  }
  return 'unknown'
}

// Response banks per client — varies slightly by gender pronoun
function getResponses(clientName) {
  const isMichelle = clientName === 'Michelle'
  const they = isMichelle ? 'she' : 'he'
  const them = isMichelle ? 'her' : 'him'
  const their = isMichelle ? 'her' : 'his'

  return {
    greeting: [
      `Hi. Thanks for seeing me.`,
      `Hi... yeah. Um. Thanks.`,
      `Hello. I wasn't sure what to expect, but... hi.`,
    ],
    ask_name: [
      `${clientName}. ${clientName} ${isMichelle ? 'Lewis' : 'Harris'}.`,
      `It's ${clientName}.`,
      `${clientName}. Nice to meet you, I guess.`,
    ],
    how_are_you: [
      `Honestly? Not great. It's been a really rough few weeks.`,
      `I've been better. A lot better, actually.`,
      `I'm... managing. Trying to, anyway.`,
    ],
    how_can_i_help: [
      `Well... I'm basically homeless right now. I lost my apartment about three weeks ago and I've been sleeping in my car. My friend told me you might be able to help with housing stuff. And I have this balance at the university that I can't pay, and I'm worried I'm going to have to drop out.`,
      `I don't even know where to start. I lost my place to live and I'm kind of in crisis mode. I was told this agency helps with housing? I also have some financial stuff going on with school that's really stressing me out.`,
      `My housing situation is really bad. I'm sleeping in my car right now. And I have a bill at school I can't pay. I don't know what I qualify for or even where to look.`,
    ],
    informed_consent: [
      `Okay... what does the part about confidentiality mean exactly? Like, who can you share my information with?`,
      `Can you explain the exceptions to confidentiality? The part about harm — does that mean you'd have to tell someone if I said I was stressed out?`,
      `Sure, I'll listen. But what does "stop services at any time" mean — can I just walk out if this isn't working?`,
    ],
    informed_consent_followup: [
      `Okay, that makes sense. Yes, I agree to that. Verbally, like you said.`,
      `Alright. Yeah, I consent. I appreciate you explaining it instead of just handing me a form.`,
      `Okay. I consent. Can we keep going?`,
    ],
    agency_services: [
      `Wait — you have utility assistance? I've been worried about my phone bill. And case management — what does that actually involve?`,
      `So you help with food too? I've honestly been skipping meals some days to save money. I didn't realize the Salvation Army did all of this.`,
      `The groceries and utility stuff could really help. I didn't know you did case management either. What does that look like?`,
    ],
    ask_services_fit: [
      `Probably the case management — I feel like I don't even know what I'm supposed to do next. And maybe the food assistance, honestly. I've been pretty careful about spending on food.`,
      `The housing resources for sure, if you have them. And the case management. I need someone to help me figure out this university bill situation.`,
      `I think the utility assistance and case management. I'm trying to keep my phone on so I don't miss calls from work, and I need help making a plan.`,
    ],
    open_question_housing: [
      `My landlord raised the rent and I just... couldn't cover it. I'm working at Burger King part time but it's not enough. I had to choose between the rent and the university bill, and I thought I could figure it out but then I just lost the apartment.`,
      `It kind of fell apart all at once. My hours got cut at work, and I had this balance at school that I kept pushing off, and then the rent was due and I didn't have it. My landlord gave me two weeks and that was it.`,
      `It's embarrassing to talk about. I thought I could manage it. I was doing okay for a while but then everything hit at the same time — the school bill, rent, work hours getting cut. I didn't want to call my family.`,
    ],
    open_question_feelings: [
      `Scary, honestly. I'm trying to stay focused on school but it's hard to study when you don't know where you're going to sleep. I keep telling myself it's temporary but... I don't know.`,
      `It's exhausting. I'm trying to act normal at work and at school but I'm running on fumes. I shower at the gym and I'm trying to keep it together.`,
      `Really isolating. I haven't told anyone except the friend who referred me here. I don't want people to know.`,
    ],
    empathy_reflection: [
      `Yeah. It is. I keep thinking I should have caught it sooner, but... yeah.`,
      `It helps to hear that. I feel like I've been holding this in for a while.`,
      `Thank you. I don't usually talk about it. It's hard to say out loud.`,
    ],
    university_bill: [
      `It's about $1,800. I've been trying to set up a payment plan but the financial aid office keeps telling me to call back. I'm worried they're going to drop me from my classes.`,
      `It's from last semester. I thought my financial aid covered it but there was a gap. I didn't realize until it was already overdue.`,
      `I owe about two thousand dollars. I've been avoiding thinking about it because I don't know what to do. If I get dropped from my courses I lose my part-time status and that affects my work schedule too.`,
    ],
    housing: [
      `Yeah, I've been in my car for about three weeks. I park near campus so I can use the gym to shower. It's not... it's not great.`,
      `I'm in my car right now. I have most of my stuff in storage. I keep telling myself it's just until I figure things out.`,
      `Three weeks in my car. I try not to think about it too much. I just focus on getting through each day.`,
    ],
    work: [
      `I work at Burger King about 25 hours a week. I don't want to cut my hours because that's the only money I have coming in. Even with that I'm barely covering gas and food.`,
      `Part time at a fast food place. I can't afford to miss shifts. That's part of why I can't just move home — I'd lose my job.`,
      `I've been there about eight months. My manager's been understanding but I can't ask for advances or anything. I'm just trying to keep that job.`,
    ],
    family: [
      `My family's in Ohio. We're not really close. I don't want to tell them what's going on — they'd worry and I don't want to feel like a burden. I'm trying to handle it myself.`,
      `They're far away and it's complicated. I haven't talked to them much since I moved here for school. I don't want to go back.`,
      `I have parents back home but we don't really have that kind of relationship. I stopped going to church here too, so I don't really have a local support system.`,
    ],
    unknown: [
      `I'm sorry, can you say more about what you mean?`,
      `I'm not sure I follow. What are you asking?`,
      `Could you rephrase that? I want to make sure I understand.`,
      `Yeah... I'm listening.`,
    ],
  }
}

// Track which responses have been used to avoid repetition
const usedIndices = {}

function pickResponse(bank, intent) {
  if (!bank[intent] || bank[intent].length === 0) return bank.unknown[0]
  if (!usedIndices[intent]) usedIndices[intent] = []

  const available = bank[intent]
    .map((_, i) => i)
    .filter(i => !usedIndices[intent].includes(i))

  if (available.length === 0) {
    usedIndices[intent] = []
    return bank[intent][0]
  }

  const idx = available[Math.floor(Math.random() * available.length)]
  usedIndices[intent].push(idx)
  return bank[intent][idx]
}

// Whether the consent has been explained (to trigger followup vs initial)
let consentExplained = false

export function resetScriptedState() {
  Object.keys(usedIndices).forEach(k => delete usedIndices[k])
  consentExplained = false
}

export function getScriptedResponse(userMessage, clientName, messageCount) {
  const intent = detectIntent(userMessage)
  const bank = getResponses(clientName)

  // After the first consent response, use the followup for subsequent consent messages
  if (intent === 'informed_consent') {
    if (consentExplained) {
      return pickResponse(bank, 'informed_consent_followup')
    }
    consentExplained = true
    return pickResponse(bank, 'informed_consent')
  }

  return pickResponse(bank, intent)
}

// Scripted feedback responses for the debrief phase
export function getScriptedFeedback(clientName, isOpening = false) {
  const isMichelle = clientName === 'Michelle'

  const openingResponses = [
    `Overall it was okay. There were moments where I felt like you were really listening, and moments where it felt more like you were going through a checklist. The informed consent part felt a little rushed — I would have liked more time to ask questions about it.`,
    `It was helpful in some ways. I appreciated that you asked how I was doing at the start — that felt genuine. I think I would have opened up more if there had been a little more space for me to talk before moving into the paperwork.`,
    `Honestly, I felt pretty comfortable by the end. The beginning felt a little formal, but once we got into talking about my situation I felt like you were actually interested in what I was going through.`,
  ]

  const followupResponses = [
    `The questions that helped most were the ones where you asked me to explain more — like when you asked what led to losing the apartment. I felt like I could actually tell my story.`,
    `I noticed you reflected back what I said a couple of times. That made me feel heard. I wish that had happened more at the beginning.`,
    `The informed consent explanation was the part that felt most procedural. It would help if it felt more like a conversation and less like reading off a list.`,
    `I think the hardest part for me was when the questions felt closed — like yes or no questions. I wasn't sure how much you actually wanted to know.`,
    `What helped was when you connected the agency services to what I'd told you about my situation. That felt personal, not generic.`,
  ]

  if (isOpening) {
    return openingResponses[Math.floor(Math.random() * openingResponses.length)]
  }
  return followupResponses[Math.floor(Math.random() * followupResponses.length)]
}

// Scripted assessment based on message count and detected patterns in conversation
export function getScriptedAssessment(clientName, messages) {
  const studentMessages = messages.filter(m => m.role === 'user').map(m => m.content.toLowerCase())
  const allStudentText = studentMessages.join(' ')

  const check = (patterns) => patterns.some(p => p.test(allStudentText))

  const greeted = check([/hello|hi |hey |good morning|my name is/i])
  const askedName = check([/your name|call you/i])
  const askedHow = check([/how are you|how.*doing/i])
  const didConsent = check([/informed consent|confidential|sign|agree|services agreement/i])
  const explainedServices = check([/food|groceries|utility|case management|services (we|this)/i])
  const askedOpenQ = check([/tell me more|what happened|how did|what led|describe|walk me through/i])
  const usedReflection = check([/it sounds like|i hear|i understand|that must|sounds (difficult|hard|tough)/i])
  const exploredfFit = check([/which.*useful|what.*might help|apply to you/i])

  return `## Performance Summary

### Criterion by Criterion

**1. Greeting & Professional Introduction** — ${greeted ? 'Proficient' : 'Not Observed'}
${greeted ? `You opened the session with a greeting that established initial contact.${askedName ? ' You also asked for the client\'s name, which is an important first step in building rapport.' : ' Consider making sure to ask for the client\'s name early — using it throughout the session builds connection.'}` : `No clear greeting or professional introduction was detected in the transcript. Starting with a warm, named introduction sets the tone for the entire session.`}

**2. Opening & Inviting the Client's Story** — ${askedHow ? 'Proficient' : 'Developing'}
${askedHow ? `You asked how ${clientName} was doing, which creates space before moving into the reason for the visit. This signals genuine interest rather than a purely transactional interaction.` : `The transcript does not show a clear open invitation for ${clientName} to share how they are doing. This step helps the client feel welcome before the procedural elements begin.`}

**3. Informed Consent: Delivery & Explanation** — ${didConsent ? 'Developing' : 'Not Observed'}
${didConsent ? `You introduced the informed consent process, which is a critical step. To reach Proficient or Excellent, make sure you are summarizing each item in your own words rather than reading verbatim, and explicitly addressing the confidentiality exceptions — clients often have questions about those limits.` : `The informed consent process does not appear clearly in the transcript. This is a required procedural step and must be addressed before exploring the presenting problem in depth.`}

**4. Informed Consent: Client Questions & Verbal Consent** — ${didConsent ? 'Developing' : 'Not Observed'}
${didConsent ? `Inviting the client to ask questions about the consent form — and waiting for a genuine response — is what separates a procedural checkbox from a true informed process. Make sure you explicitly invited questions and confirmed verbal consent before moving on.` : `Without a clear informed consent exchange, verbal consent cannot be confirmed. This is a foundational requirement of the engagement process.`}

**5. Agency Services Explanation** — ${explainedServices ? 'Proficient' : 'Not Observed'}
${explainedServices ? `You described agency services during the session. Strong practice includes asking permission before launching into the explanation, and connecting specific services to what the client has already shared about their situation.` : `Agency services were not clearly explained in this session. Clients need this information to understand what support is available and whether it fits their situation.`}

**6. Exploring Goodness of Fit & Client Motivation** — ${exploredfFit ? 'Proficient' : 'Developing'}
${exploredfFit ? `You asked ${clientName} which services might be useful — this is a key move that positions the client as an active participant rather than a passive recipient. Good work.` : `The transcript does not show a clear moment where you asked ${clientName} which services felt relevant to their situation. Asking this question, rather than telling the client what they need, is central to a strengths-based approach.`}

**7. Eliciting & Exploring the Presenting Problem** — ${askedOpenQ ? 'Proficient' : 'Developing'}
${askedOpenQ ? `You invited ${clientName} to share more about their situation, which is the heart of the engagement phase. The presenting problem — housing loss and its contributing factors — needs continued exploration to fully understand the client's circumstances.` : `The presenting problem was not explored deeply in this session. After the procedural steps, returning to the client's story with curiosity and open questions is essential.`}

**8. Open Questioning Skills** — ${askedOpenQ ? 'Developing' : 'Insufficient'}
${askedOpenQ ? `Some open questions were present in the transcript. To strengthen this area: aim for questions that begin with "what," "how," or "tell me about" rather than questions that can be answered with yes or no. Notice how ${clientName} responded differently to different question types.` : `The transcript shows limited use of open-ended questions. Open questions — "What led to losing the apartment?" rather than "Did you lose your apartment?" — are the primary tool for inviting the client's story.`}

**9. Reflective Listening & Conveying Empathy** — ${usedReflection ? 'Proficient' : 'Developing'}
${usedReflection ? `You used reflective language in the session, which communicates that you are actively processing what the client shares. True reflection goes beyond summarizing — it names what the client seems to be experiencing emotionally, not just factually.` : `Reflective listening was not clearly present in this transcript. Paraphrasing what the client says — and naming the feeling beneath the content — is one of the most powerful tools in engagement.`}

---

### Strengths
- ${greeted && askedHow ? `Your opening established a human tone before moving into procedure — this matters more than students often realize.` : `You engaged with the client's presenting situation, which shows orientation toward their actual needs.`}
- ${explainedServices ? `You covered agency services, ensuring ${clientName} had information about available resources.` : `You initiated the conversation and created an opening for the client to share.`}

### Areas for Growth
- ${!didConsent ? `Informed consent must be addressed in every first session — practice introducing it naturally, not as an interruption to the conversation.` : `Deepen the informed consent process: summarize each item in your own words, pause for questions, and confirm verbal consent explicitly before moving on.`}
- ${!usedReflection ? `Add reflective statements throughout — not just at the end. When ${clientName} shares something significant, reflect it back before asking the next question.` : `Work on the specificity of your reflections. Move from "that sounds hard" to naming what you observe: "It sounds like you've been managing this alone for a while and you're exhausted."` }

### Overall Observation
${studentMessages.length < 4
  ? `This session was brief — there may not have been enough exchange to fully demonstrate the engagement skills the rubric requires. In your actual assessment, aim to keep the conversation moving through all eight steps of the interview guide within the 20-minute window.`
  : `You worked through several key elements of the engagement process. The area that will most visibly elevate your practice is moving from procedural efficiency to genuine curiosity — slowing down, reflecting more, and letting ${clientName}'s responses guide your next question rather than your checklist. Try another session and notice what changes when you prioritize listening over moving forward.`
}`
}
