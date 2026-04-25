export const AGENCY_SERVICES = {
  services: ['Food', 'Groceries', 'Utility assistance', 'Special seasonal needs', 'Disaster relief', 'Case management'],
  populations: ['Low-income families', 'Working poor', 'Disabled individuals', 'Senior citizens'],
}

export const CLIENTS = {
  michelle: {
    id: 'michelle',
    name: 'Michelle',
    age: 22,
    pronouns: 'she/her',
    label: 'Michelle, 22',
    color: 'teal',
    tier: 'standard',
    voiceId: '21m00Tcm4TlvDq8ikWAM', // ElevenLabs: Rachel
    avatar: 'https://api.dicebear.com/9.x/personas/svg?seed=michelle-consent-sim&backgroundColor=ccfbf1',
    summary: `Michelle is a 22-year-old college student who recently lost her off-campus apartment. She is sleeping in her car and showering at the campus fitness center. A friend convinced her to contact a social worker at the local Salvation Army to inquire about housing resources and help with budgeting. Michelle cannot afford to live on campus and has an outstanding balance on her university account. She is unsure if she qualifies for any community programs and knows very little about how to find resources. She works part-time at a fast-food restaurant and is a part-time student. She is worried she will have to drop out if she cannot resolve her outstanding university bill. She does not want to miss work because it is her only source of income. She has family in another state but rarely visits. Michelle recently stopped attending a local faith community. This is your first meeting with Michelle. You have been in this position for 3 months.`,
  },
  david: {
    id: 'david',
    name: 'David',
    age: 22,
    pronouns: 'he/him',
    label: 'David, 22',
    color: 'amber',
    tier: 'standard',
    voiceId: 'yoZ06aMxZJJ28mfd3POQ', // ElevenLabs: Sam — young, raspy, natural
    avatar: 'https://api.dicebear.com/9.x/personas/svg?seed=david-consent-sim&backgroundColor=fef3c7',
    summary: `David is a 22-year-old college student who recently lost his off-campus apartment. He is sleeping in his car and showering at the campus fitness center. A friend convinced him to contact a social worker at the local Salvation Army to inquire about housing resources and help with budgeting. David cannot afford to live on campus and has an outstanding balance on his university account. He is unsure if he qualifies for any community programs and knows very little about how to find resources. He works part-time at a fast-food restaurant and is a part-time student. He is worried he will have to drop out if he cannot resolve his outstanding university bill. He does not want to miss work because it is his only source of income. He has family in another state but rarely visits. David recently stopped attending a local faith community. This is your first meeting with David. You have been in this position for 3 months.`,
  },
  carlos: {
    id: 'carlos',
    name: 'Carlos',
    age: 54,
    pronouns: 'he/him',
    label: 'Carlos, 54',
    color: 'orange',
    tier: 'advanced',
    voiceId: 'pNInz6obpgDQGcFmaJgB', // ElevenLabs: Adam
    avatar: 'https://api.dicebear.com/9.x/personas/svg?seed=carlos-consent-sim&backgroundColor=ffedd5',
    summary: `Carlos is a 54-year-old man who was released from a state correctional facility eight weeks ago after serving a two-year sentence for a non-violent offense. He is currently staying with a cousin but that arrangement ends in two weeks. He has been unable to secure housing because landlords have denied him due to his record. He had a steady job as a landscaper for fifteen years before his incarceration and wants to return to that work, but finding clients and transportation is difficult without a stable address. He has a 19-year-old son he is trying to reconnect with; their relationship is strained. Carlos has been sober for three years, including his time incarcerated, and attends AA meetings regularly. He is proud of his sobriety and does not want it to define how people see him. He is not sure what services the Salvation Army offers and came in on the recommendation of his parole officer. This is your first meeting with Carlos. You have been in this position for 3 months.`,
  },
  aisha: {
    id: 'aisha',
    name: 'Aisha',
    age: 31,
    pronouns: 'she/her',
    label: 'Aisha, 31',
    color: 'purple',
    tier: 'advanced',
    voiceId: 'AZnzlk1XvdvUeBnXmlld', // ElevenLabs: Domi
    avatar: 'https://api.dicebear.com/9.x/personas/svg?seed=aisha-consent-sim&backgroundColor=f3e8ff',
    summary: `Aisha is a 31-year-old mother of two children, ages 4 and 9. She left a domestic violence situation six weeks ago and is currently staying at a women's emergency shelter with her children. The shelter has a 60-day residency limit, and she has approximately two weeks remaining. Her former partner has been contacting her family members trying to find her location; she has a protective order in place but is still fearful. Aisha has not worked in four years — her partner pressured her to leave her job — and her work history before that was in retail and food service. She has no savings and her name is not on any utility accounts or leases, which makes establishing credit history for housing difficult. She is guarded about sharing details of her situation, particularly anything that might reveal her location or the specifics of the abuse. She came to the Salvation Army because a shelter advocate referred her. This is your first meeting with Aisha. You have been in this position for 3 months.`,
  },
}

export const INTERVIEW_GUIDE = [
  { id: 1, text: 'Greet the client — introduce yourself and ask for their name.' },
  { id: 2, text: 'Ask how they are doing, then ask "How can I help you?"' },
  { id: 3, text: 'Briefly reflect what you hear, then introduce the Informed Consent for Services. Summarize each item in your own words. Ask if they have questions, then obtain verbal consent.' },
  { id: 4, text: 'Ask permission to explain agency services, then describe them using the guide.' },
  { id: 5, text: 'Ask the client to continue talking about why they came for help.' },
  { id: 6, text: 'Ask open-ended questions about what they share and reflect back what you hear.' },
  { id: 7, text: 'Convey that you understand their story.' },
  { id: 8, text: 'Ask which agency services might be useful to them.' },
]

export const INFORMED_CONSENT_TEXT = `INFORMED CONSENT FOR SERVICES

I understand that if I choose to sign this Informed Consent for Services, I will receive an explanation of the services offered by this agency.

I understand that I may receive any of these services for which I am eligible.

I understand that I may stop my services at any time.

I understand that I have a right to review any written material created by the agency in serving me.

I understand that what I discuss with the social worker or anyone else in the agency will not be disclosed to anyone except under the following circumstances:
  • If what I discuss involves the immediate possibility of harm or threatened harm to myself.
  • If what I discuss involves the immediate possibility of harm or threatened harm to another person.
  • If what I discuss suggests there is reason to believe that a person under eighteen years of age or an elderly or incapacitated person has been abused or neglected or is threatened with abuse or neglect.
  • If I am required by a court of law to disclose information through a court order.

I understand that I have the right to ask for a review of my case if I determine I am not receiving the services I need or if I believe I am not being treated fairly.`

export const CLIENT_COLORS = {
  teal:   { bg: 'bg-teal-100',   text: 'text-teal-700',   border: 'border-teal-200',   ring: 'ring-teal-300' },
  amber:  { bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-200',  ring: 'ring-amber-300' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', ring: 'ring-orange-300' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', ring: 'ring-purple-300' },
}
