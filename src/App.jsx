import { useState } from 'react'
import SetupScreen from './components/SetupScreen.jsx'
import InterviewScreen from './components/InterviewScreen.jsx'
import FeedbackScreen from './components/FeedbackScreen.jsx'
import AssessmentScreen from './components/AssessmentScreen.jsx'
import { resetSessionUsage } from './lib/api.js'

// Phases map to Kolb's Experiential Learning Cycle:
// setup → interview (CE) → feedback (RO) → assessment (AC) → restart (AE)

export default function App() {
  const [phase, setPhase] = useState('setup')
  const [clientId, setClientId] = useState(null)
  const [interviewMessages, setInterviewMessages] = useState([])
  const [feedbackMessages, setFeedbackMessages] = useState([])

  const handleStart = (selectedClientId) => {
    resetSessionUsage()
    setClientId(selectedClientId)
    setPhase('interview')
  }

  const handleInterviewComplete = (messages) => {
    setInterviewMessages(messages)
    setPhase('feedback')
  }

  const handleFeedbackComplete = (iMessages, fMessages) => {
    setInterviewMessages(iMessages)
    setFeedbackMessages(fMessages)
    setPhase('assessment')
  }

  const handleRestart = () => {
    setPhase('setup')
    setClientId(null)
    setInterviewMessages([])
    setFeedbackMessages([])
  }

  return (
    <>
      {phase === 'setup' && (
        <SetupScreen onStart={handleStart} />
      )}
      {phase === 'interview' && clientId && (
        <InterviewScreen
          clientId={clientId}
          onInterviewComplete={handleInterviewComplete}
        />
      )}
      {phase === 'feedback' && clientId && (
        <FeedbackScreen
          clientId={clientId}
          interviewMessages={interviewMessages}
          onFeedbackComplete={handleFeedbackComplete}
        />
      )}
      {phase === 'assessment' && clientId && (
        <AssessmentScreen
          clientId={clientId}
          interviewMessages={interviewMessages}
          feedbackMessages={feedbackMessages}
          onRestart={handleRestart}
        />
      )}
    </>
  )
}
