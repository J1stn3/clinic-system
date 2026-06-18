import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAppointments, usePatients } from '../../hooks/useEntityOptions'
import { api } from '../../services/api'
import { Button } from '../ui/button'
import { Card } from '../ui/PageShell'
import { Input, Label, Textarea } from '../ui/input'

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

  return (
    <Card className="mb-6">
      <h3 className="mb-2 font-semibold">Unified Clinical Workflow</h3>
      <p className="mb-4 text-sm text-slate-600">Step {step} of 4 — Appointment → Consultation → CDSS/Prescription → Lab</p>

      {step === 1 && (
        <div className="space-y-3">
          <div>
            <Label>Appointment</Label>
            <select
              className="w-full rounded-md border px-3 py-2"
              value={appointmentId}
              onChange={(e) => {
                setAppointmentId(e.target.value)
                const apt = appointments.data?.find((a) => a.id === e.target.value)
                if (apt?.patientId) setPatientId(apt.patientId)
              }}
            >
              <option value="">Select appointment...</option>
              {(appointments.data ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id.slice(0, 8)}... — {a.patientName ?? 'Patient'} ({a.status})
                </option>
              ))}
            </select>
          </div>
          <Button onClick={() => appointmentId && setStep(2)}>Next: Consultation</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <div>
            <Label>Patient (for downstream steps)</Label>
            <select className="w-full rounded-md border px-3 py-2" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
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
            <Textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} />
          </div>
          <div>
            <Label>Diagnosis</Label>
            <Textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              onClick={() => saveConsultation.mutate()}
              disabled={!appointmentId || !symptoms}
            >
              Save & Continue
            </Button>
            <Button variant="outline" onClick={() => navigate('/ai-clinical-support')}>
              Open CDSS
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <div>
            <Label>Prescription Medication</Label>
            <Input value={medication} onChange={(e) => setMedication(e.target.value)} />
          </div>
          <Button onClick={() => savePrescription.mutate()} disabled={!patientId || !medication}>
            Add Prescription
          </Button>
          <div>
            <Label>Lab Test</Label>
            <Input value={testName} onChange={(e) => setTestName(e.target.value)} />
          </div>
          <Button onClick={() => saveLab.mutate()} disabled={!patientId || !testName}>
            Request Lab Test
          </Button>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button onClick={() => setStep(4)}>Finish</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="text-center">
          <p className="mb-4 text-teal-700">Clinical workflow completed for this encounter.</p>
          <Button onClick={() => { setStep(1); setAppointmentId(''); setSymptoms(''); setDiagnosis('') }}>
            Start New Workflow
          </Button>
        </div>
      )}
    </Card>
  )
}
