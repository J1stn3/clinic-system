import { useMutation } from '@tanstack/react-query'
import { Check, ClipboardList, FlaskConical, Pill, Stethoscope, Video } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAppointments, usePatients } from '../../hooks/useEntityOptions'
import { api } from '../../services/api'
import { Button } from '../ui/button'
import { Card } from '../ui/PageShell'
import { Input, Label, Textarea } from '../ui/input'
import { cn } from '../../lib/utils'

const STEPS = [
  { n: 1, label: 'Appointment', icon: ClipboardList },
  { n: 2, label: 'Consultation', icon: Stethoscope },
  { n: 3, label: 'Rx & Lab', icon: Pill },
  { n: 4, label: 'Complete', icon: Check },
]

export default function ClinicalWizard() {
  const navigate = useNavigate()
  const appointments = useAppointments()
  const patients = usePatients()
  const [step, setStep] = useState(1)
  const [appointmentId, setAppointmentId] = useState('')
  const [patientId, setPatientId] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [medication, setMedication] = useState('')
  const [testName, setTestName] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)

  const selectedAppointment = appointments.data?.find((a) => a.id === appointmentId)

  const saveConsultation = useMutation({
    mutationFn: () => api.post('/Consultation', { appointmentId, symptoms, diagnosis }),
    onSuccess: () => {
      toast.success('Consultation saved')
      setStep(3)
    },
  })

  const savePrescription = useMutation({
    mutationFn: () => api.post('/Prescription', { patientId, medication, dosage: '1x daily', instructions: 'Take with food' }),
    onSuccess: () => toast.success('Prescription created'),
  })

  const saveLab = useMutation({
    mutationFn: () => api.post('/Laboratory', { patientId, testName }),
    onSuccess: () => toast.success('Lab test requested'),
  })

  const completeSession = useMutation({
    mutationFn: async () => {
      if (sessionId) {
        await api.put(`/Telemedicine/${sessionId}`, { status: 'Completed' })
      }
    },
    onSuccess: () => toast.success('Telemedicine session completed'),
  })

  const loadSession = useMutation({
    mutationFn: async (aptId: string) => {
      const { data } = await api.get<{ id: string }>(`/Telemedicine/appointment/${aptId}`)
      return data
    },
    onSuccess: (data) => setSessionId(data.id),
    onError: () => setSessionId(null),
  })

  return (
    <Card>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Unified Clinical Workflow</h3>
          <p className="text-sm text-slate-500">Step {step} of 4 — guided encounter documentation</p>
        </div>
      </div>

      <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2">
        {STEPS.map(({ n, label, icon: Icon }) => (
          <div key={n} className="flex flex-1 min-w-[100px] items-center gap-2">
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                step >= n ? 'bg-aicare-teal text-white' : 'bg-slate-100 text-slate-400',
              )}
            >
              {step > n ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </div>
            <span className={cn('hidden text-xs font-medium sm:inline', step >= n ? 'text-slate-900' : 'text-slate-400')}>
              {label}
            </span>
            {n < 4 && <div className={cn('h-0.5 flex-1 rounded', step > n ? 'bg-aicare-teal' : 'bg-slate-200')} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <Label>Appointment</Label>
            <select
              className="aicare-input mt-1"
              value={appointmentId}
              onChange={(e) => {
                setAppointmentId(e.target.value)
                const apt = appointments.data?.find((a) => a.id === e.target.value)
                if (apt?.patientId) setPatientId(apt.patientId)
                if (apt?.isVirtual) loadSession.mutate(e.target.value)
                else setSessionId(null)
              }}
            >
              <option value="">Select appointment...</option>
              {(appointments.data ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.patientName ?? 'Patient'} — {a.isVirtual ? 'Virtual' : 'In-Person'} — {a.status}
                </option>
              ))}
            </select>
          </div>

          {selectedAppointment?.isVirtual && (
            <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-2 text-cyan-900">
                  <Video className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium">Virtual visit — join the video room before documenting.</span>
                </div>
                <Link to={`/telemedicine/room/${appointmentId}`} className="w-full sm:w-auto">
                  <Button variant="accent" className="w-full sm:w-auto" disabled={!appointmentId}>
                    Join Video Room
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <Button variant="accent" className="w-full sm:w-auto" onClick={() => appointmentId && setStep(2)} disabled={!appointmentId}>
            Next: Consultation
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {selectedAppointment?.isVirtual && appointmentId && (
            <Link to={`/telemedicine/room/${appointmentId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-aicare-teal hover:underline">
              <Video className="h-4 w-4" />
              Return to video room
            </Link>
          )}
          <div>
            <Label>Patient</Label>
            <select className="aicare-input mt-1" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
              <option value="">Select patient...</option>
              {(patients.data ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName ?? p.id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Symptoms</Label>
            <Textarea className="mt-1 min-h-[100px]" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="Describe presenting symptoms..." />
          </div>
          <div>
            <Label>Diagnosis</Label>
            <Textarea className="mt-1 min-h-[80px]" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Primary diagnosis..." />
          </div>
          <div className="aicare-page-actions">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button variant="accent" onClick={() => saveConsultation.mutate()} disabled={!appointmentId || !symptoms || saveConsultation.isPending}>
              Save & Continue
            </Button>
            <Button variant="outline" onClick={() => navigate('/ai-clinical-support')}>
              Open CDSS
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-100 p-4">
              <div className="mb-3 flex items-center gap-2 text-slate-800">
                <Pill className="h-4 w-4 text-aicare-teal" />
                <span className="font-medium">Prescription</span>
              </div>
              <Input value={medication} onChange={(e) => setMedication(e.target.value)} placeholder="Medication name" />
              <Button className="mt-3 w-full" variant="outline" onClick={() => savePrescription.mutate()} disabled={!patientId || !medication}>
                Add Prescription
              </Button>
            </div>
            <div className="rounded-xl border border-slate-100 p-4">
              <div className="mb-3 flex items-center gap-2 text-slate-800">
                <FlaskConical className="h-4 w-4 text-aicare-teal" />
                <span className="font-medium">Lab Request</span>
              </div>
              <Input value={testName} onChange={(e) => setTestName(e.target.value)} placeholder="Test name" />
              <Button className="mt-3 w-full" variant="outline" onClick={() => saveLab.mutate()} disabled={!patientId || !testName}>
                Request Lab Test
              </Button>
            </div>
          </div>
          <div className="aicare-page-actions">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              variant="accent"
              onClick={async () => {
                if (selectedAppointment?.isVirtual && sessionId) {
                  await completeSession.mutateAsync()
                }
                setStep(4)
              }}
            >
              Finish Encounter
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="rounded-xl bg-teal-50 px-6 py-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-aicare-teal text-white">
            <Check className="h-7 w-7" />
          </div>
          <p className="text-lg font-semibold text-slate-900">Clinical workflow completed</p>
          <p className="mt-1 text-sm text-slate-600">All encounter data has been saved for this patient.</p>
          <Button
            className="mt-6 w-full sm:w-auto"
            variant="accent"
            onClick={() => {
              setStep(1)
              setAppointmentId('')
              setSessionId(null)
              setSymptoms('')
              setDiagnosis('')
              setMedication('')
              setTestName('')
            }}
          >
            Start New Workflow
          </Button>
        </div>
      )}
    </Card>
  )
}
