import { useState } from 'react'
import { CLIENTS, CLIENT_COLORS, INTERVIEW_GUIDE, INFORMED_CONSENT_TEXT, AGENCY_SERVICES } from '../lib/clients.js'
import ClientAvatar from './ClientAvatar.jsx'

export function PhaseIndicator({ currentPhase }) {
  const phases = [
    { id: 'setup',      label: 'Preparation' },
    { id: 'interview',  label: 'Interview'    },
    { id: 'feedback',   label: 'Reflection'   },
    { id: 'assessment', label: 'Assessment'   },
  ]
  const currentIndex = phases.findIndex(p => p.id === currentPhase)

  return (
    <div className="flex items-center gap-0">
      {phases.map((phase, i) => (
        <div key={phase.id} className="flex items-center">
          <div className="flex items-center gap-1.5">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              i < currentIndex  ? 'bg-sage-500 text-white' :
              i === currentIndex ? 'bg-sage-700 text-white' :
              'bg-warm-200 text-gray-400'
            }`}>
              {i < currentIndex ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block transition-colors ${
              i === currentIndex ? 'text-sage-700' :
              i < currentIndex  ? 'text-sage-500' :
              'text-gray-400'
            }`}>
              {phase.label}
            </span>
          </div>
          {i < phases.length - 1 && (
            <div className={`w-6 sm:w-10 h-px mx-2 transition-colors ${
              i < currentIndex ? 'bg-sage-400' : 'bg-warm-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  )
}

function ClientCard({ client, selected, onSelect }) {
  const colors = CLIENT_COLORS[client.color]
  return (
    <button
      onClick={() => onSelect(client.id)}
      className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
        selected
          ? `${colors.border} shadow-medium ring-2 ${colors.ring} ring-offset-2 bg-white`
          : 'border-warm-200 bg-white hover:border-warm-300 hover:shadow-soft'
      }`}
    >
      <div className="flex items-center gap-3">
        <ClientAvatar client={client} size="xl" />
        <div>
          <p className="font-semibold text-gray-800">{client.name}, {client.age}</p>
          <p className="text-xs text-gray-500">{client.pronouns}</p>
        </div>
        {selected && (
          <div className={`ml-auto w-5 h-5 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center text-xs font-bold`}>✓</div>
        )}
      </div>
      <p className="mt-2 text-xs text-gray-500 leading-relaxed line-clamp-2">
        {client.summary.slice(0, 120)}...
      </p>
    </button>
  )
}

export default function SetupScreen({ onStart }) {
  const [selectedClient, setSelectedClient] = useState(null)
  const [step, setStep] = useState('select')

  const client = selectedClient ? CLIENTS[selectedClient] : null
  const standardClients = Object.values(CLIENTS).filter(c => c.tier === 'standard')
  const advancedClients = Object.values(CLIENTS).filter(c => c.tier === 'advanced')

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      <header className="bg-white border-b border-warm-200 px-5 py-4 shadow-softer">
        <div className="max-w-3xl mx-auto">
          <p className="text-sage-600 text-xs font-semibold uppercase tracking-widest">Generalist Practice with Individuals and Families</p>
          <h1 className="text-xl font-semibold text-gray-800 mt-0.5">Client Engagement Practice Simulator</h1>
        </div>
      </header>

      <div className="bg-white border-b border-warm-200 px-5 py-3">
        <div className="max-w-3xl mx-auto">
          <PhaseIndicator currentPhase="setup" />
        </div>
      </div>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {step === 'select' && (
            <SelectStep
              selectedClient={selectedClient}
              standardClients={standardClients}
              advancedClients={advancedClients}
              onSelect={setSelectedClient}
              onNext={() => setStep('brief')}
            />
          )}
          {step === 'brief' && client && (
            <BriefStep client={client} onBack={() => setStep('select')} onNext={() => setStep('guide')} />
          )}
          {step === 'guide' && client && (
            <GuideStep client={client} onBack={() => setStep('brief')} onStart={() => onStart(selectedClient)} />
          )}
        </div>
      </main>
    </div>
  )
}

function SelectStep({ selectedClient, standardClients, advancedClients, onSelect, onNext }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Choose Your Client</h2>
        <p className="mt-1.5 text-gray-500 leading-relaxed">
          Select who you'll interview. Start with a standard scenario to build your fundamentals, or challenge yourself with an advanced case.
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Standard Scenarios</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {standardClients.map(c => (
            <ClientCard key={c.id} client={c} selected={selectedClient === c.id} onSelect={onSelect} />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Advanced Scenarios</p>
          <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">More complex</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {advancedClients.map(c => (
            <ClientCard key={c.id} client={c} selected={selectedClient === c.id} onSelect={onSelect} />
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!selectedClient}
        className="w-full py-3.5 bg-sage-600 text-white font-medium rounded-2xl hover:bg-sage-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-soft hover:shadow-medium"
      >
        Continue to Case Brief
      </button>
    </div>
  )
}

function BriefStep({ client, onBack, onNext }) {
  const colors = CLIENT_COLORS[client.color]
  const [consentOpen, setConsentOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <ClientAvatar client={client} size="2xl" />
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Case Brief — {client.name}</h2>
          <p className="text-sm text-gray-400">Review before your interview. You may reference this during the session.</p>
        </div>
      </div>

      {client.tier === 'advanced' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-2">
          <span className="text-amber-500 mt-0.5">⚠</span>
          <p className="text-sm text-amber-800"><strong>Advanced scenario.</strong> This case involves a more complex presenting situation. Apply all the same engagement skills — and pay close attention to tone and pacing.</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-soft p-5">
        <p className="text-gray-700 leading-relaxed">{client.summary}</p>
      </div>

      <Accordion title="Informed Consent for Services" open={consentOpen} onToggle={() => setConsentOpen(o => !o)}>
        <pre className="whitespace-pre-wrap text-sm text-gray-600 font-sans leading-relaxed">{INFORMED_CONSENT_TEXT}</pre>
      </Accordion>

      <Accordion title="Agency Services Reference" open={servicesOpen} onToggle={() => setServicesOpen(o => !o)}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Services Offered</p>
            <ul className="space-y-1.5">
              {AGENCY_SERVICES.services.map(s => (
                <li key={s} className="text-sm text-gray-600 flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full bg-sage-400 flex-shrink-0`} />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Populations Served</p>
            <ul className="space-y-1.5">
              {AGENCY_SERVICES.populations.map(p => (
                <li key={p} className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage-400 flex-shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Accordion>

      <div className="flex gap-3 pt-1">
        <button onClick={onBack} className="flex-1 py-3 border border-warm-200 text-gray-600 font-medium rounded-2xl hover:bg-warm-100 transition-colors">
          Back
        </button>
        <button onClick={onNext} className="flex-1 py-3 bg-sage-600 text-white font-medium rounded-2xl hover:bg-sage-700 transition-all shadow-soft">
          Continue to Interview Guide
        </button>
      </div>
    </div>
  )
}

function GuideStep({ client, onBack, onStart }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Interview Guide</h2>
        <p className="mt-1.5 text-gray-500 leading-relaxed">
          Use this as a reference, not a script. Don't read items aloud to the client.
          You'll have <strong className="text-gray-700">20 minutes</strong> for the interview and <strong className="text-gray-700">5 minutes</strong> for client feedback.
        </p>
      </div>

      <div className="bg-sage-50 border border-sage-100 rounded-2xl px-5 py-4">
        <p className="text-sm font-semibold text-sage-800 mb-1">This is a safe space to practice</p>
        <p className="text-sm text-sage-700 leading-relaxed">There's no penalty for mistakes here — that's the point. Try different approaches, pay attention to how {client.name} responds to your tone and phrasing, and use the reflection time after the interview to notice what landed and what didn't. You can always start over.</p>
      </div>

      <ol className="space-y-2.5">
        {INTERVIEW_GUIDE.map(item => (
          <li key={item.id} className="flex gap-4 bg-white rounded-2xl shadow-softer border border-warm-100 p-4">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-sage-600 text-white text-sm font-bold flex items-center justify-center">
              {item.id}
            </span>
            <p className="text-gray-700 text-sm leading-relaxed">{item.text}</p>
          </li>
        ))}
      </ol>

      <div className="bg-sage-50 border border-sage-100 rounded-2xl px-5 py-4">
        <p className="text-sm text-sage-800">
          After the 20-minute interview, {client.name} will share honest feedback about how the interaction felt from their perspective. That conversation is part of the learning — engage with it genuinely.
        </p>
      </div>

      <div className="flex gap-3 pt-1">
        <button onClick={onBack} className="flex-1 py-3 border border-warm-200 text-gray-600 font-medium rounded-2xl hover:bg-warm-100 transition-colors">
          Back
        </button>
        <button onClick={onStart} className="flex-1 py-3 bg-sage-600 text-white font-medium rounded-2xl hover:bg-sage-700 transition-all shadow-soft">
          Begin Interview with {client.name}
        </button>
      </div>
    </div>
  )
}

function Accordion({ title, open, onToggle, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-softer border border-warm-100 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-warm-50 transition-colors"
      >
        <span className="font-medium text-gray-700">{title}</span>
        <span className={`text-gray-400 text-xl transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-warm-100 pt-4">
          {children}
        </div>
      )}
    </div>
  )
}
