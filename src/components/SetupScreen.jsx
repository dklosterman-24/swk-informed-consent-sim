import { useState } from 'react'
import { CLIENTS, INTERVIEW_GUIDE, INFORMED_CONSENT_TEXT, AGENCY_SERVICES } from '../lib/clients.js'

export default function SetupScreen({ onStart }) {
  const [selectedClient, setSelectedClient] = useState(null)
  const [step, setStep] = useState('select') // 'select' | 'brief' | 'guide'

  const client = selectedClient ? CLIENTS[selectedClient] : null

  return (
    <div className="min-h-screen bg-navy-50 flex flex-col">
      {/* Header */}
      <header className="bg-navy-700 text-white px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-navy-100 text-sm font-medium tracking-wide uppercase">Generalist Practice with Individuals and Families</p>
          <h1 className="text-xl font-semibold mt-0.5">Client Engagement Practice Simulator</h1>
        </div>
      </header>

      {/* Kolb phase indicator */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-3xl mx-auto">
          <PhaseIndicator currentPhase="setup" />
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-start px-4 py-8">
        <div className="w-full max-w-3xl">

          {step === 'select' && (
            <SelectStep
              selectedClient={selectedClient}
              onSelect={setSelectedClient}
              onNext={() => setStep('brief')}
            />
          )}

          {step === 'brief' && client && (
            <BriefStep
              client={client}
              onBack={() => setStep('select')}
              onNext={() => setStep('guide')}
            />
          )}

          {step === 'guide' && client && (
            <GuideStep
              client={client}
              onBack={() => setStep('brief')}
              onStart={() => onStart(selectedClient)}
            />
          )}

        </div>
      </main>
    </div>
  )
}

function SelectStep({ selectedClient, onSelect, onNext }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-navy-700">Choose Your Client</h2>
        <p className="mt-2 text-gray-600">
          Select the client you will interview. Both scenarios are identical except for gender — you may be assigned either in the actual assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.values(CLIENTS).map(c => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`p-5 rounded-lg border-2 text-left transition-all ${
              selectedClient === c.id
                ? 'border-navy-600 bg-navy-50 ring-2 ring-navy-600 ring-offset-2'
                : 'border-gray-200 bg-white hover:border-navy-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                selectedClient === c.id ? 'bg-navy-700' : 'bg-gray-400'
              }`}>
                {c.name[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{c.name}</p>
                <p className="text-sm text-gray-500">{c.pronouns}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">22-year-old college student presenting for housing resources and budgeting assistance</p>
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!selectedClient}
        className="w-full py-3 bg-navy-700 text-white font-medium rounded-lg hover:bg-navy-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Continue to Case Brief
      </button>
    </div>
  )
}

function BriefStep({ client, onBack, onNext }) {
  const [consentOpen, setConsentOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-navy-700">Case Brief — {client.name}</h2>
        <p className="mt-1 text-sm text-gray-500">Review this before your interview. You may reference it during the session.</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <p className="text-gray-700 leading-relaxed">{client.summary}</p>
      </div>

      {/* Informed Consent accordion */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setConsentOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 text-left"
        >
          <span className="font-medium text-gray-800">Informed Consent for Services</span>
          <span className="text-gray-400 text-lg">{consentOpen ? '−' : '+'}</span>
        </button>
        {consentOpen && (
          <div className="px-5 pb-5 bg-white border-t border-gray-100">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed mt-3">
              {INFORMED_CONSENT_TEXT}
            </pre>
          </div>
        )}
      </div>

      {/* Agency services accordion */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setServicesOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 text-left"
        >
          <span className="font-medium text-gray-800">Agency Services Reference</span>
          <span className="text-gray-400 text-lg">{servicesOpen ? '−' : '+'}</span>
        </button>
        {servicesOpen && (
          <div className="px-5 pb-5 bg-white border-t border-gray-100">
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Services Offered</p>
                <ul className="space-y-1">
                  {AGENCY_SERVICES.services.map(s => (
                    <li key={s} className="text-sm text-gray-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-navy-600 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Populations Served</p>
                <ul className="space-y-1">
                  {AGENCY_SERVICES.populations.map(p => (
                    <li key={p} className="text-sm text-gray-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-navy-600 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
          Back
        </button>
        <button onClick={onNext} className="flex-1 py-3 bg-navy-700 text-white font-medium rounded-lg hover:bg-navy-800 transition-colors">
          Continue to Interview Guide
        </button>
      </div>
    </div>
  )
}

function GuideStep({ client, onBack, onStart }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-navy-700">Interview Guide</h2>
        <p className="mt-1 text-sm text-gray-600">
          Use this as a reference during the interview — it is a guide, not a script. Do not read items verbatim to the client.
          You will have <strong>20 minutes</strong> for the interview and <strong>5 minutes</strong> for client feedback.
        </p>
      </div>

      <ol className="space-y-3">
        {INTERVIEW_GUIDE.map(item => (
          <li key={item.id} className="flex gap-4 bg-white rounded-lg border border-gray-200 p-4">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-navy-700 text-white text-sm font-semibold flex items-center justify-center">
              {item.id}
            </span>
            <p className="text-gray-700 text-sm leading-relaxed">{item.text}</p>
          </li>
        ))}
      </ol>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-4">
        <p className="text-sm text-amber-800">
          <strong>Reminder:</strong> After the 20-minute interview, {client.name} will give you 5 minutes of honest feedback on how the interaction felt from the client's perspective. This is part of the learning experience.
        </p>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
          Back
        </button>
        <button onClick={onStart} className="flex-1 py-3 bg-navy-700 text-white font-medium rounded-lg hover:bg-navy-800 transition-colors">
          Begin Interview with {client.name}
        </button>
      </div>
    </div>
  )
}

export function PhaseIndicator({ currentPhase }) {
  const phases = [
    { id: 'setup', label: 'Preparation' },
    { id: 'interview', label: 'Interview' },
    { id: 'feedback', label: 'Client Feedback' },
    { id: 'assessment', label: 'Assessment' },
  ]
  const currentIndex = phases.findIndex(p => p.id === currentPhase)

  return (
    <div className="flex items-center gap-0">
      {phases.map((phase, i) => (
        <div key={phase.id} className="flex items-center">
          <div className="flex items-center gap-1.5">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
              i < currentIndex ? 'bg-green-500 text-white' :
              i === currentIndex ? 'bg-navy-700 text-white' :
              'bg-gray-200 text-gray-400'
            }`}>
              {i < currentIndex ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${
              i === currentIndex ? 'text-navy-700' : i < currentIndex ? 'text-green-600' : 'text-gray-400'
            }`}>
              {phase.label}
            </span>
          </div>
          {i < phases.length - 1 && (
            <div className={`w-8 sm:w-12 h-px mx-1 ${i < currentIndex ? 'bg-green-400' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
