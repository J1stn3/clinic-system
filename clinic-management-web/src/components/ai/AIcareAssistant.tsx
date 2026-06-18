import { Minimize2, Send, Sparkles, X } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { cn } from '../../lib/utils'
import { uiStore } from '../../stores/uiStore'
import { Button } from '../ui/button'

type Message = { role: 'assistant' | 'user'; text: string }

const SUGGESTED = [
  'How do I book an appointment?',
  'Show my upcoming appointments.',
  'Explain my laboratory result.',
  'Explain my prescription.',
  'What should I prepare before my consultation?',
  'Show my medical history.',
]

const REPLIES: Record<string, string> = {
  'How do I book an appointment?':
    'Go to Appointments in the sidebar, then click Book Appointment. Choose your doctor, date, and time. You can also ask your clinic front desk to help.',
  'Show my upcoming appointments.':
    'Open the Appointments page to see your scheduled visits. Your next visit is typically shown on your Dashboard health summary.',
  'Explain my laboratory result.':
    'Laboratory results are listed under Laboratory. I can help explain common terms in plain language — always confirm final interpretation with your doctor.',
  'Explain my prescription.':
    'Visit Prescriptions to see active medications, dosage, and instructions. Take medicines exactly as prescribed and contact your doctor if you have side effects.',
  'What should I prepare before my consultation?':
    'Bring a valid ID, insurance or PhilHealth documents if applicable, a list of current medications, and any recent lab results. Arrive 15 minutes early.',
  'Show my medical history.':
    'Your medical history is available under Medical Records, including past diagnoses, allergies, and visit notes shared with you by your care team.',
}

function AIcareAssistantBase() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Hello! I am your AIcare Assistant. I can help you navigate the portal and understand your health information in simple language. How can I help you today?',
    },
  ])
  const [input, setInput] = useState('')

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const reply =
      REPLIES[trimmed] ??
      'I can help with appointments, prescriptions, lab results, and navigating AIcare. For medical decisions, please consult your doctor. Try one of the suggested questions below.'
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: trimmed },
      { role: 'assistant', text: reply },
    ])
    setInput('')
  }

  if (!uiStore.assistantOpen) {
    return (
      <button
        type="button"
        onClick={() => uiStore.setAssistantOpen(true)}
        className="aicare-fab-mobile fixed z-50 flex h-14 w-14 animate-pulse-soft items-center justify-center rounded-full bg-gradient-to-br from-aicare-blue to-aicare-teal text-white shadow-glass transition-transform hover:scale-105"
        aria-label="Open AIcare Assistant"
      >
        <Sparkles className="h-6 w-6" />
      </button>
    )
  }

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-glass animate-slide-up',
        uiStore.assistantExpanded
          ? 'inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom)+0.5rem)] top-3 sm:inset-auto sm:bottom-4 sm:right-4 sm:left-4 sm:top-4 md:left-auto md:w-[480px]'
          : 'inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom)+0.5rem)] h-[min(520px,calc(100dvh-5.5rem-env(safe-area-inset-bottom)))] sm:inset-auto sm:bottom-6 sm:right-6 sm:left-auto sm:h-[min(560px,calc(100vh-3rem))] sm:w-[min(400px,calc(100vw-2rem))]',
      )}
    >
      <div className="flex items-center justify-between bg-gradient-to-r from-aicare-blue to-aicare-teal px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">AIcare Assistant</p>
            <p className="flex items-center gap-1 text-[10px] text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
              Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-lg p-1.5 hover:bg-white/15"
            onClick={() => uiStore.toggleAssistantExpanded()}
            aria-label={uiStore.assistantExpanded ? 'Minimize' : 'Expand'}
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-lg p-1.5 hover:bg-white/15"
            onClick={() => uiStore.setAssistantOpen(false)}
            aria-label="Close assistant"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="border-b border-amber-100 bg-amber-50 px-3 py-2 text-[11px] leading-snug text-amber-900">
        AIcare Assistant provides informational guidance only and does not replace professional medical advice.
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              'max-w-[90%] rounded-xl px-3 py-2 text-sm',
              msg.role === 'assistant'
                ? 'bg-aicare-surface text-slate-700'
                : 'ml-auto bg-primary text-white',
            )}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 p-3">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-aicare-gray">Suggested</p>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {SUGGESTED.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-left text-[11px] text-slate-600 transition-colors hover:border-aicare-teal hover:text-aicare-teal"
            >
              {q}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(input)}
            placeholder="Ask AIcare anything about your care…"
            className="aicare-input h-10 flex-1"
          />
          <Button type="button" size="sm" onClick={() => send(input)} aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default observer(AIcareAssistantBase)
