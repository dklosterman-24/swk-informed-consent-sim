// Scripted response engine — no LLM required.
// Detects intent from the student's message and returns an in-character response.

const INTENT_PATTERNS = [
  { intent: 'greeting',             patterns: [/hello|hi |hey |good morning|good afternoon|welcome|my name is|i'?m .*(social worker|here to|from the)/i] },
  { intent: 'ask_name',             patterns: [/your name|what'?s? your name|may i (ask|get) your name|call you|i'?m? sorry.{0,10}didn'?t (get|catch)/i] },
  { intent: 'how_are_you',          patterns: [/how are you|how'?re you doing|how do you feel|how has (your|things)|how'?s everything/i] },
  { intent: 'how_can_i_help',       patterns: [/how can i help|what brings you|what can i do for you|tell me what|why (did you|have you) come|what (are you|brought you)|what'?s going on/i] },
  { intent: 'informed_consent',     patterns: [/informed consent|consent form|confidential|privacy|sign|agree|services agreement|before we (begin|start|go further|continue)|paperwork|form/i] },
  { intent: 'agency_services',      patterns: [/services (we |this agency |salvat|offer|provid|availab)|what we (do|offer|provide)|agency (offer|provid|has)|food|groceries|utility|case management|disaster/i] },
  { intent: 'open_question_story',  patterns: [/tell me (more|about)|what happened|how did (that|this)|what led|what (was it|were the circumstances)|describe|share more|walk me through|say more|elaborate/i] },
  { intent: 'open_question_feel',   patterns: [/how (does that|do you) feel|what'?s? that like|what are you (experiencing|going through)|that sounds|must be (hard|difficult|tough|stressful|a lot)/i] },
  { intent: 'ask_services_fit',     patterns: [/which (of these|services)|what (here|of this|do you think) (might|could|would) (help|be useful|work)|useful to you|apply to (you|your situation)|most helpful/i] },
  { intent: 'empathy_reflection',   patterns: [/i (hear|understand|can see|imagine|sense) (that|you|how)|it sounds like|it seems like|that must (be|have)|sounds (difficult|hard|tough|challenging|stressful|overwhelming)|i'?m sorry (to hear|you'?re)/i] },
  { intent: 'ask_support_system',   patterns: [/family|support system|friends|anyone (help|support)|people (around|in your life)|close to|back home|network/i] },
  { intent: 'ask_next_steps',       patterns: [/next step|what'?s? (the )?plan|going forward|from here|priority|what (should|can) (we|you) (do|focus)/i] },
  { intent: 'ask_kids',             patterns: [/kids?|children|son|daughter|school|childcare/i] },
  { intent: 'transition',           patterns: [/i'?d? like to (move on|shift|talk about|ask about)|before we (continue|move)|let me (ask|share|explain)|i want to/i] },
  { intent: 'affirmation',          patterns: [/^(okay|ok|i see|i understand|thank you|thanks|got it|alright|sure|absolutely|of course)[\.,!]?\s*$/i] },
]

function detectIntent(text) {
  const trimmed = text.trim()
  for (const { intent, patterns } of INTENT_PATTERNS) {
    if (patterns.some(p => p.test(trimmed))) return intent
  }
  return 'unknown'
}

// ─── Response banks per client ────────────────────────────────────────────────

function davidResponses() {
  return {
    greeting: [
      `Hey. Thanks for seeing me.`,
      `Hi. I wasn't totally sure what to expect, but... hey.`,
      `Hi there. Yeah, thanks.`,
    ],
    ask_name: [
      `David. David Harris.`,
      `It's David.`,
      `David. Nice to meet you, I think.`,
    ],
    how_are_you: [
      `Honestly? Not great. It's been a rough few weeks.`,
      `I've been better. A lot better, actually.`,
      `I'm managing. Trying to be, anyway.`,
    ],
    how_can_i_help: [
      `So... I basically lost my apartment about three weeks ago. I've been sleeping in my car. A friend told me you might be able to help with housing stuff. And I have this outstanding balance at school that I can't pay, and I'm scared I'm going to have to drop out.`,
      `It's kind of a lot. I lost my place to live and I'm in crisis mode. I heard this agency helps with housing? And I've also got some financial stuff going on with school that's really stressing me out.`,
      `My housing situation is pretty bad right now. I'm sleeping in my car. And I have a bill at school I can't pay. I don't really know where to start.`,
    ],
    informed_consent: [
      `Okay... can you explain the confidentiality part more? Like, who can you actually share my information with?`,
      `What does the part about "exceptions" to confidentiality mean in plain terms? The harm stuff — does being stressed count?`,
      `Sure. But what does it mean that I can stop services at any time? Like I can just leave if this isn't working?`,
    ],
    informed_consent_followup: [
      `Okay. Yeah, I consent. Verbally, like you said.`,
      `Alright, that makes sense. I agree to that.`,
      `Okay. I'm good with that. Can we keep going?`,
    ],
    agency_services: [
      `Wait — you have utility assistance? I've been stressed about my phone bill. And what does case management actually involve?`,
      `You help with food too? I've honestly been skipping meals to save money. I didn't know the Salvation Army did all of this.`,
      `The groceries and utility stuff could really help. What does case management look like exactly?`,
    ],
    ask_services_fit: [
      `Probably case management — I feel like I don't even know what steps to take. And maybe food assistance, if I'm being honest.`,
      `Housing resources for sure. And case management. I need help figuring out this university bill situation.`,
      `Utility assistance and case management. I need to keep my phone on, and I need someone to help me make a plan.`,
    ],
    open_question_story: [
      `My landlord raised the rent and I just couldn't cover it. I'm working at Burger King part time but it's not enough. I had to choose between rent and the university bill, and then I lost the apartment.`,
      `It all fell apart at once. My hours got cut, I had this school balance I kept putting off, and then rent was due and I didn't have it. Two weeks later I was out.`,
      `It's embarrassing to talk about. I thought I could manage it. Then everything hit at the same time — school, rent, work hours getting cut — and I didn't want to call my family.`,
    ],
    open_question_feel: [
      `Scary, honestly. It's hard to focus on school when you don't know where you're sleeping. I keep telling myself it's temporary.`,
      `Exhausting. I'm trying to act normal at work and in class, but I'm running on fumes. I shower at the campus gym.`,
      `Really isolating. I haven't told anyone except the friend who told me to come here.`,
    ],
    empathy_reflection: [
      `Yeah. It is. I keep thinking I should have caught it sooner.`,
      `It helps a little to hear that. I've been holding this in.`,
      `Thank you. It's hard to say out loud.`,
    ],
    ask_support_system: [
      `My family's in Ohio. We're not really close. I don't want to tell them what's going on — I don't want to feel like a burden.`,
      `Far away and complicated. I haven't talked to them much since I moved here for school.`,
      `I don't really have one here. I stopped going to church too, so... yeah.`,
    ],
    ask_next_steps: [
      `I don't even know. That's kind of why I'm here. I don't know what order to do things in.`,
      `I think I need to figure out the housing situation first. Everything else feels impossible when you don't have a place to sleep.`,
      `Probably the university bill — if I lose my enrollment I lose my student status and that affects everything.`,
    ],
    affirmation: [
      `Yeah. Okay.`,
      `Alright.`,
      `Sure.`,
    ],
    transition: [
      `Okay. I'm listening.`,
      `Sure, go ahead.`,
      `Yeah, okay.`,
    ],
    unknown: [
      `Sorry, can you say more about what you mean?`,
      `I'm not sure I follow. Can you rephrase that?`,
      `Could you explain what you're asking?`,
      `Yeah... I'm listening.`,
    ],
  }
}

function michelleResponses() {
  return {
    ...davidResponses(),
    ask_name: [
      `Michelle. Michelle Lewis.`,
      `It's Michelle.`,
      `Michelle. Hi.`,
    ],
    how_can_i_help: [
      `I lost my apartment about three weeks ago. I've been sleeping in my car and showering at the campus gym. My friend said you might be able to help with housing. And I have this university balance I can't pay — I'm scared I'll have to drop out.`,
      `It's kind of a mess. I lost my place, I'm in my car, and I've got a balance at school I can't deal with right now. I heard you help with housing?`,
      `My housing situation is really bad. Car for three weeks. And there's a bill at school I can't pay. I really don't know where to turn.`,
    ],
    open_question_story: [
      `My landlord raised the rent and my hours at work got cut around the same time. I couldn't cover both the rent and the school bill, and then the apartment was gone.`,
      `It kind of crept up on me. I kept thinking I'd figure it out, and then all of a sudden I was out.`,
      `It's hard to talk about. I thought I was handling it. Then everything hit at once and I didn't want to ask my family for help.`,
    ],
    ask_support_system: [
      `My family's out of state. We don't really talk much. I don't want them to worry — or to make me feel like I failed.`,
      `Not really. I stopped going to my church here, so I don't have much of a community anymore.`,
      `I have a couple of friends at school. The one who told me to come here. That's about it.`,
    ],
  }
}

function carlosResponses() {
  return {
    greeting: [
      `Hi. My parole officer suggested I come in. I'll be honest — this isn't easy for me.`,
      `Hello. I'm not really used to asking for help, but I'm here.`,
      `Hi. Yeah. Thanks for seeing me.`,
    ],
    ask_name: [
      `Carlos. Carlos Reyes.`,
      `It's Carlos.`,
      `Carlos. Nice to meet you.`,
    ],
    how_are_you: [
      `I'm doing okay, considering. I've been through harder things. But this... this is a different kind of hard.`,
      `Honestly, I've been better. I'm trying to stay focused but the housing situation is stressing me out.`,
      `I'm managing. I've been sober three years now. That part I've got. The rest is still a work in progress.`,
    ],
    how_can_i_help: [
      `I got out of prison about eight weeks ago. Two years for a non-violent offense — I'm not going to get into the details right now if that's okay. I'm staying with my cousin but that ends in two weeks and I can't find anyone who'll rent to me with a record. My parole officer said maybe you could help with housing resources.`,
      `The housing is the main thing. I've been out eight weeks, staying with family, but it's temporary. I've been to three different places and they won't rent to me because of my record. I worked landscaping for fifteen years before everything happened. I just need a chance to get stable again.`,
      `I need help finding housing. I've been denied everywhere because of my background. I'm not a danger to anyone — I did my time, I've been sober three years, I'm trying to reconnect with my son. I just can't get a foot in the door.`,
    ],
    informed_consent: [
      `I need to understand the confidentiality piece. Does anything I tell you get shared with my parole officer or the state?`,
      `What about the part where you said there are exceptions — the harm stuff. What counts as "harm" exactly?`,
      `Can I ask — if I decide to stop, does that affect my parole in any way? I just want to know what I'm agreeing to.`,
    ],
    informed_consent_followup: [
      `Okay. That's clearer than I expected. Yeah, I give my verbal consent.`,
      `Alright. I appreciate you explaining it instead of just handing me a form. I consent.`,
      `Okay. I'm good with that. Let's keep going.`,
    ],
    agency_services: [
      `Housing resources — that's the main thing. And what does case management actually involve? Is that someone helping me figure out next steps, or is it more like monitoring?`,
      `I didn't know the Salvation Army did case management. That might be the most useful thing for me. I need help navigating what I'm eligible for.`,
      `The food assistance would honestly help right now. And I'd want to know more about case management — is that someone who works with me one-on-one?`,
    ],
    ask_services_fit: [
      `Case management, for sure. I need someone who can help me figure out what I'm eligible for and in what order to do things. And maybe the food assistance short-term.`,
      `Mainly the housing resources and case management. I know how to work — I just need somewhere to live so I can stabilize everything else.`,
      `The case management. I've been on my own figuring this out and I keep hitting walls. Having someone who knows the system would make a real difference.`,
    ],
    open_question_story: [
      `I had my own landscaping clients — small business, nothing huge, but I was doing okay. Then I made some bad decisions and I got caught. Two years. I lost the business, lost my apartment, almost lost my son. I've been working on that last part since I got out.`,
      `Before I went in, I had structure. I had a routine, a business, relationships. Prison strips all of that. When you get out, everyone assumes the worst about you. I've been sober three years. I did the work. I just need someone to give me a chance.`,
      `My son is 19 now. We're talking again — slowly. He's angry, and he has every right to be. I missed a lot. I'm trying to show him I'm different now, but it's hard to do that when I don't have a stable place to even invite him to.`,
    ],
    open_question_feel: [
      `Like I'm starting over at 54. Which I am. Most people my age are thinking about retirement. I'm thinking about whether I can get an apartment.`,
      `Frustrated. I've done everything right since I got out. I go to my AA meetings, I check in with my PO, I'm looking for work. But the record follows you everywhere.`,
      `Determined, mostly. I'm not going to let this be the end of my story. But I'd be lying if I said it wasn't exhausting.`,
    ],
    empathy_reflection: [
      `Yeah. It is what it is. I made my choices. I just want the chance to make better ones now.`,
      `Thank you. Most people don't say that. They either judge you or they act like it didn't happen. I appreciate you just... acknowledging it.`,
      `It means something to hear that. I don't always let myself feel it, but yeah.`,
    ],
    ask_support_system: [
      `My cousin's been good to me. My son is coming around slowly. My AA sponsor is solid. Outside of that, not much. Most of my old friendships didn't survive the incarceration.`,
      `Limited. My parole officer is involved. My cousin. My sponsor. That's about it. My family relationships are complicated by what happened.`,
      `I have my AA network, which is real. And my cousin. My son and I are rebuilding. That's the support system I'm working with.`,
    ],
    ask_next_steps: [
      `Housing first. Once I have a stable address everything else gets easier — finding work, rebuilding the landscaping business, seeing my son more.`,
      `I need to know what housing options exist for someone with my background. That's step one. After that, I can figure out the rest.`,
      `I'd want to understand what I qualify for. I've been doing this solo and I keep hitting dead ends. A plan would help.`,
    ],
    affirmation: [`Okay.`, `Alright.`, `Yeah.`],
    transition: [`Sure. Go ahead.`, `I'm listening.`, `Okay.`],
    unknown: [
      `Can you explain what you mean by that?`,
      `I'm not sure I'm following you. What are you asking?`,
      `Say more.`,
      `I'm listening.`,
    ],
  }
}

function aishaResponses() {
  return {
    greeting: [
      `Hi. A shelter advocate sent me here. I'm not sure what you can help with but I'm willing to listen.`,
      `Hello. I'll be honest — I'm a little careful about who I talk to right now. But I'm here.`,
      `Hi. Yeah. Thanks for seeing me today.`,
    ],
    ask_name: [
      `Aisha. I'd rather not give my last name right now if that's okay.`,
      `Aisha.`,
      `It's Aisha.`,
    ],
    how_are_you: [
      `I'm okay. I'm safe, which is the most important thing right now. But I'm dealing with a lot.`,
      `Managing. I have two kids and I'm trying to stay focused on what needs to happen next.`,
      `I've had better years. But I'm okay.`,
    ],
    how_can_i_help: [
      `I left a bad situation about six weeks ago. I'm at a women's shelter right now with my two kids — they're 4 and 9. The shelter has a 60-day limit and I have about two weeks left. I need help finding somewhere to go. I don't have rental history, no savings, my name isn't on any accounts. I don't know how to get housing from where I am.`,
      `I need housing help, basically. I'm at a shelter with my kids and my time there is almost up. I left my partner six weeks ago. I haven't worked in four years — he didn't want me to. I'm trying to figure out how to rebuild but I don't know where to start.`,
      `The advocate at the shelter said you might be able to help with housing resources and case management. I have two kids, I'm almost out of time at the shelter, and I'm trying to figure out next steps without letting anyone know where I am. My ex has been asking around.`,
    ],
    informed_consent: [
      `I need to ask — does anything I share here get recorded somewhere that he could access? I have a protective order but I'm still being careful.`,
      `The confidentiality part — what are the exceptions exactly? I want to understand what could get shared and with who.`,
      `Can you explain the part about "harm to another person"? I want to make sure I understand that before I agree to anything.`,
    ],
    informed_consent_followup: [
      `Okay. Thank you for being specific about that. I consent — verbally.`,
      `Alright. That's helpful to know. Yes, I agree.`,
      `Okay. I feel better having heard that explained. I consent.`,
    ],
    agency_services: [
      `Case management — yes. That's probably what I need most. And food assistance. I've been trying to stretch what the shelter provides.`,
      `I didn't realize you do case management. That would help me most — I need someone who knows the system to help me figure out housing options for someone in my situation.`,
      `The food stuff would help. And anything around housing resources. I don't have a credit history, no lease history, no savings. I need to know what options actually exist for someone like me.`,
    ],
    ask_services_fit: [
      `Case management is the most urgent. I need help figuring out what housing options exist for someone with a protective order and no rental history. And food assistance while I'm getting stable.`,
      `Housing resources and case management. If I could get somewhere safe and stable for me and my kids, I can figure out the rest. I'm not afraid of work.`,
      `Mainly case management. I've been out of the workforce for four years and I don't know how to navigate all of this. I need a guide, not just a list of resources.`,
    ],
    open_question_story: [
      `I was with him for six years. Things got bad gradually — it's hard to explain how it happens if it hasn't happened to you. I left when I knew my kids were starting to see things they shouldn't see. I took them and I left. I haven't looked back but I'm scared sometimes.`,
      `I gave up my job when he asked me to. I thought it was about being home with the kids. It wasn't. Now I'm starting over at 31 with no employment history, no savings, and two kids who need stability. I'm not looking for sympathy. I just need help navigating what's available.`,
      `The shelter has been good. But I've been lying awake thinking about what happens when the 60 days is up. My kids are in a new school. My 9-year-old is finally making friends again. I don't want to disrupt that. I need something stable.`,
    ],
    open_question_feel: [
      `Honestly? Determined. And scared underneath that. I'm not going to let fear make decisions for me anymore, but it's still there.`,
      `Some days I feel strong. Some days I can't believe this is my life at 31. But I focus on the kids. That keeps me moving forward.`,
      `Like I have to hold everything together for my kids so I don't really let myself feel it very much. I'll process it later. Right now I just need a plan.`,
    ],
    empathy_reflection: [
      `Thank you. People don't always know what to say. That felt like the right thing.`,
      `Yeah. It is a lot. I don't usually let myself say that.`,
      `I appreciate that. I've been staying so focused on logistics that I haven't really let myself sit with how hard this is.`,
    ],
    ask_support_system: [
      `I have a couple of friends from before, but I've been keeping my location private. My family is complicated — some of them are still in contact with my ex. The shelter advocate has been helpful.`,
      `Limited. I've been careful about who knows where I am. The advocate here is the main person. My kids are my reason for everything.`,
      `Not much right now. I cut off a lot of contact because I wasn't sure who he might be talking to. I'm working on rebuilding that slowly.`,
    ],
    ask_next_steps: [
      `I need to find housing before my time at the shelter ends. That's the most urgent thing. After that, I need to figure out childcare and employment.`,
      `Housing first. Then figuring out how to get back into the workforce after four years away. I'm willing to work — I just need a foot in the door.`,
      `I'd want to know what housing programs I actually qualify for given my situation. I've heard there are options for people with protective orders but I don't know how to access them.`,
    ],
    affirmation: [`Okay.`, `Alright.`, `Yes.`],
    transition: [`Go ahead.`, `I'm listening.`, `Okay.`],
    unknown: [
      `Can you say more about what you mean?`,
      `I'm not quite following. Can you explain?`,
      `What specifically are you asking?`,
      `I'm listening.`,
    ],
  }
}

const RESPONSE_BANKS = {
  michelle: michelleResponses(),
  david:    davidResponses(),
  carlos:   carlosResponses(),
  aisha:    aishaResponses(),
}

const usedIndices = {}
let consentExplained = {}

export function resetScriptedState() {
  Object.keys(usedIndices).forEach(k => delete usedIndices[k])
  Object.keys(consentExplained).forEach(k => delete consentExplained[k])
}

function pickResponse(clientId, intent) {
  const bank = RESPONSE_BANKS[clientId] || RESPONSE_BANKS.david
  const responses = bank[intent] || bank.unknown
  const key = `${clientId}:${intent}`
  if (!usedIndices[key]) usedIndices[key] = []

  const available = responses.map((_, i) => i).filter(i => !usedIndices[key].includes(i))
  if (available.length === 0) {
    usedIndices[key] = []
    return responses[0]
  }

  const idx = available[Math.floor(Math.random() * available.length)]
  usedIndices[key].push(idx)
  return responses[idx]
}

export function getScriptedResponse(userMessage, clientId) {
  const intent = detectIntent(userMessage)

  if (intent === 'informed_consent') {
    if (consentExplained[clientId]) return pickResponse(clientId, 'informed_consent_followup')
    consentExplained[clientId] = true
    return pickResponse(clientId, 'informed_consent')
  }

  return pickResponse(clientId, intent)
}

// ─── Feedback phase ────────────────────────────────────────────────────────────

const FEEDBACK_OPENING = {
  david: [
    `Overall it was... okay. There were moments where I felt like you were actually listening, and moments where it felt more like you were getting through a checklist. The informed consent part went pretty fast — I would have liked a little more time to ask questions about it.`,
    `It helped. I appreciated that you asked how I was doing at the start — that felt real. I think I would have opened up more if there was more space to talk before we got into the paperwork.`,
    `I felt pretty comfortable by the end. The beginning was a little formal, but once we got into talking about my situation I felt like you were interested in what I was going through.`,
  ],
  michelle: [
    `It was okay. There were parts where I felt heard and parts where it felt a bit rushed. Especially the consent form — I wanted to ask more but it felt like we were moving on.`,
    `I appreciated the opening — asking how I was doing made a difference. I think more space to talk early on would have helped me feel more comfortable.`,
    `By the end I felt more at ease. It started a little stiff but the questions about my situation felt genuine.`,
  ],
  carlos: [
    `I'll be straight with you — I came in ready for judgment and I didn't get it. That meant something. The thing I'd say is that the confidentiality explanation could have been slower. That part matters a lot to someone in my situation and I wasn't sure I fully understood the exceptions before we moved on.`,
    `I felt like you were genuinely interested, not just processing me. That's not nothing. I would have liked more space to talk about what I'm actually dealing with before getting into what the agency offers — I wasn't ready to think about services yet when we got there.`,
    `Honestly it was better than I expected. The thing that helped most was that you didn't treat my background like it was the whole story. I'm more than what happened. I felt like you understood that, or were trying to.`,
  ],
  aisha: [
    `I came in guarded — that's just where I am right now. You didn't push, which I appreciated. The consent piece went a little fast for me. I had a question about confidentiality and what gets shared, but it felt like we were moving on so I didn't ask it. For someone in my situation, that part needs more time.`,
    `You gave me space to talk, which helped. I don't always feel like I can say the full story without being judged or redirected. The open questions worked better for me than the direct ones — I'm careful about what I say and how.`,
    `It was okay. I think the thing I'd say is just — slow down during the paperwork. Don't assume someone understands just because they nod. I nodded and I still had questions.`,
  ],
}

const FEEDBACK_FOLLOWUP = [
  `The questions that helped most were the open ones — when you asked me to explain more, I felt like I could actually tell my story.`,
  `The moment I felt most heard was when you reflected back what I said. It showed you were actually listening and not just waiting to ask the next question.`,
  `The informed consent explanation is the part that can feel most procedural. It would help if it felt more like a real conversation and less like going through a list.`,
  `I noticed when your questions were closed — yes or no — I gave shorter answers. I wasn't sure how much detail you actually wanted.`,
  `What helped was when you connected the services back to what I'd already told you. That felt personal, not generic.`,
  `I think I would have opened up sooner if there had been more of a back-and-forth at the beginning, before the paperwork.`,
]

export function getScriptedFeedback(clientId, isOpening = false) {
  const openings = FEEDBACK_OPENING[clientId] || FEEDBACK_OPENING.david
  if (isOpening) return openings[Math.floor(Math.random() * openings.length)]
  return FEEDBACK_FOLLOWUP[Math.floor(Math.random() * FEEDBACK_FOLLOWUP.length)]
}

// ─── Assessment ────────────────────────────────────────────────────────────────

export function getScriptedAssessment(clientName, messages) {
  const studentMessages = messages.filter(m => m.role === 'user').map(m => m.content.toLowerCase())
  const allText = studentMessages.join(' ')
  const check = (patterns) => patterns.some(p => p.test(allText))

  const greeted      = check([/hello|hi |hey |good morning|my name is/i])
  const askedName    = check([/your name|call you/i])
  const askedHow     = check([/how are you|how.*doing/i])
  const didConsent   = check([/informed consent|confidential|sign|agree|form/i])
  const didServices  = check([/food|groceries|utility|case management|services (we|this)/i])
  const askedOpenQ   = check([/tell me more|what happened|how did|what led|describe|walk me through|say more/i])
  const usedReflect  = check([/it sounds like|i hear|i understand|that must|sounds (difficult|hard|tough)|i'?m sorry/i])
  const exploredfFit = check([/which.*useful|what.*might help|apply to you|most helpful/i])
  const askedSupport = check([/family|support|friends|anyone (help|support)/i])

  return `## Performance Summary

### Criterion by Criterion

**1. Greeting & Professional Introduction** — ${greeted ? 'Proficient' : 'Not Observed'}
${greeted
    ? `You opened with a greeting that established initial contact.${askedName ? ' Asking for the client\'s name and using it through the session is a small move with a big impact on rapport.' : ' Remember to ask for the client\'s name early — using it throughout signals that you see them as a person, not a case.'}`
    : `No clear greeting or professional introduction appeared in this session. A warm, named introduction sets the tone before anything else.`}

**2. Opening & Inviting the Client's Story** — ${askedHow ? 'Proficient' : 'Developing'}
${askedHow
    ? `Asking how ${clientName} was doing before moving into the reason for the visit signals genuine interest. This creates space and lowers the client's guard before the procedural elements begin.`
    : `The transcript does not show a clear opening invitation. "How are you doing?" before "What brings you in?" is not small talk — it's engagement. It signals that you care about the person, not just the presenting problem.`}

**3. Informed Consent: Delivery & Explanation** — ${didConsent ? 'Developing' : 'Not Observed'}
${didConsent
    ? `You introduced the informed consent process. To reach Proficient or Excellent: summarize each item in your own words rather than reading verbatim, and specifically address the confidentiality exceptions — clients often have unspoken questions about what those limits actually mean.`
    : `Informed consent does not appear clearly in the transcript. This is a required step in every first session — not optional, and not something to rush through. Clients deserve to understand what they're agreeing to before the conversation continues.`}

**4. Informed Consent: Client Questions & Verbal Consent** — ${didConsent ? 'Developing' : 'Not Observed'}
${didConsent
    ? `Asking the client if they have questions about consent — and genuinely waiting — is what separates a procedural step from a true informed process. Make sure you explicitly invited questions and confirmed verbal consent before moving forward.`
    : `Without a visible informed consent exchange, verbal consent cannot be confirmed. This is a foundational ethical requirement, not a formality.`}

**5. Agency Services Explanation** — ${didServices ? 'Proficient' : 'Not Observed'}
${didServices
    ? `You described agency services during the session. Strong practice adds two things: asking permission before launching into the explanation ("Would it be okay if I told you a bit about what we offer?"), and connecting specific services to what the client has already shared.`
    : `Agency services were not clearly explained in this session. Clients need this information to understand what's available — and to begin thinking about whether it fits their situation.`}

**6. Exploring Goodness of Fit & Client Motivation** — ${exploredfFit ? 'Proficient' : 'Developing'}
${exploredfFit
    ? `You asked ${clientName} which services felt relevant — a key move that positions the client as an active participant rather than a passive recipient. This is the difference between helping someone and prescribing for them.`
    : `The transcript does not show a clear moment where you invited ${clientName} to identify which services felt relevant. Asking — rather than telling — is central to a strengths-based approach.`}

**7. Eliciting & Exploring the Presenting Problem** — ${askedOpenQ ? 'Proficient' : 'Developing'}
${askedOpenQ
    ? `You invited ${clientName} to share more about what brought them in. Staying curious about the presenting problem — and returning to it after the procedural steps — is what keeps the interview feeling human rather than bureaucratic.`
    : `The presenting problem does not appear to have been explored in depth. After the procedural elements, returning to the client's story with genuine curiosity is essential.`}

**8. Open Questioning Skills** — ${askedOpenQ ? 'Developing' : 'Insufficient'}
${askedOpenQ
    ? `Some open questions were present. To strengthen this: aim for questions that begin with "what," "how," or "tell me about" — questions that require a story, not a yes or no. Notice how ${clientName}'s response length changed based on how you asked.`
    : `Open-ended questions are largely absent from this transcript. They are the primary tool for inviting the client's story. "What led to that?" gets a different response than "Did that happen suddenly?"`}

**9. Reflective Listening & Conveying Empathy** — ${usedReflect ? 'Proficient' : 'Developing'}
${usedReflect
    ? `You used reflective language — this communicates that you are actively processing what the client shares, not just waiting for your turn to speak. To deepen this: move beyond summarizing facts toward naming what the client seems to be experiencing emotionally.`
    : `Reflective listening is not clearly present in this transcript. Paraphrasing what the client says — and naming the feeling beneath the content — is one of the most powerful tools in the engagement phase. Without it, the conversation can feel like an interview rather than a connection.`}

---

### Strengths
- ${greeted && askedHow ? `Your opening established a human tone before moving into procedure. That order matters more than students often realize — it communicates that you see the person before the problem.` : `You engaged with the client's presenting situation, which shows orientation toward their actual needs rather than just completing steps.`}
- ${didServices || exploredfFit ? `You gave ${clientName} information about what's available and invited them to consider what fits — that's the core of strengths-based practice.` : askedOpenQ ? `When you asked open questions, the conversation opened up — notice what that felt like compared to moments when questions were closed.` : `You showed up and made contact. The willingness to engage is the foundation everything else builds on.`}

### Areas for Growth
- ${!didConsent ? `Informed consent must be part of every first session. Practice introducing it as a natural bridge: "Before we go further, I want to make sure you understand what working with me looks like..." rather than a bureaucratic interruption.` : `Deepen the informed consent process. Summarize each item in plain language, pause for real questions, and confirm verbal consent before moving on. The goal is a client who actually understands what they've agreed to.`}
- ${!usedReflect ? `Build in reflective statements throughout — not just at the end. When ${clientName} shares something significant, reflect it back before asking the next question. This slows the pace in a way that helps.` : `Work on the specificity of your reflections. Move from "that sounds hard" to something like: "It sounds like you've been managing this alone for a while, and you're exhausted." The more specific the reflection, the more the client feels truly seen.`}

### Overall Observation
${studentMessages.length < 4
    ? `This session was brief — there may not have been enough exchange to fully demonstrate the engagement skills the rubric requires. In your actual assessment, aim to work through all eight steps of the interview guide across the 20-minute window. More turns in the conversation means more opportunities to demonstrate open questioning and reflective listening.`
    : `You worked through several key elements of the engagement process. The quality that will most visibly elevate your practice is slowing down — letting ${clientName}'s responses guide your next question rather than your checklist. The students who score highest in this exercise are the ones who seem to forget there is a rubric. Try another session and pay attention to the moments where you feel genuinely curious about what ${clientName} will say next. That curiosity is the engine of good engagement.`}`
}
