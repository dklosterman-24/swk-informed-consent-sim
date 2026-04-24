export const AGENCY_SERVICES = {
  services: ['Food', 'Groceries', 'Utility assistance', 'Special seasonal needs', 'Disaster relief', 'Case management'],
  populations: ['Low-income families', 'Working poor', 'Disabled individuals', 'Senior citizens'],
}

export const CLIENTS = {
  michelle: {
    id: 'michelle',
    name: 'Michelle',
    pronouns: 'she/her',
    label: 'Michelle (she/her)',
    summary: `Michelle is a 22-year-old college student who recently lost her off-campus apartment. She is sleeping in her car and showering at the campus fitness center. A friend convinced her to contact a social worker at the local Salvation Army to inquire about housing resources and help with budgeting. Michelle cannot afford to live on campus and has an outstanding balance on her university account. She is unsure if she qualifies for any community programs and knows very little about how to find resources. She works part-time at a fast-food restaurant and is a part-time student. She is worried she will have to drop out if she cannot resolve her outstanding university bill. She does not want to miss work because it is her only source of income. She has family in another state but rarely visits. Michelle recently stopped attending a local faith community. This is your first meeting with Michelle. You have been in this position for 3 months.`,
  },
  michael: {
    id: 'michael',
    name: 'Michael',
    pronouns: 'he/him',
    label: 'Michael (he/him)',
    summary: `Michael is a 22-year-old college student who recently lost his off-campus apartment. He is sleeping in his car and showering at the campus fitness center. A friend convinced him to contact a social worker at the local Salvation Army to inquire about housing resources and help with budgeting. Michael cannot afford to live on campus and has an outstanding balance on his university account. He is unsure if he qualifies for any community programs and knows very little about how to find resources. He works part-time at a fast-food restaurant and is a part-time student. He is worried he will have to drop out if he cannot resolve his outstanding university bill. He does not want to miss work because it is his only source of income. He has family in another state but rarely visits. Michael recently stopped attending a local faith community. This is your first meeting with Michael. You have been in this position for 3 months.`,
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
