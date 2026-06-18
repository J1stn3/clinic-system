import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { Input, Label, Textarea } from '../ui/input'
import { Card } from '../ui/PageShell'
import { api } from '../../services/api'

export default function ConsultationWorkflow() {
  const [appointmentId, setAppointmentId] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [diagnosis, setDiagnosis] = useState('')

  const mutation = useMutation({
    mutationFn: async () =>
      api.post('/Consultation', { appointmentId, symptoms, diagnosis }),
    onSuccess: () => toast.success('Consultation saved and appointment updated'),
    onError: () => toast.error('Failed to save consultation'),
  })

  return (
    <Card className="mb-6">
      <h3 className="mb-3 font-semibold">Clinical Workflow</h3>
      <p className="mb-4 text-sm text-slate-600">
        Start consultation from appointment → document symptoms & diagnosis → optionally use AI CDSS.
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <Label>Appointment ID</Label>
          <Input value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} />
        </div>
        <div>
          <Label>Symptoms</Label>
          <Textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} />
        </div>
        <div>
          <Label>Diagnosis</Label>
          <Textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
        </div>
      </div>
      <Button className="mt-4" onClick={() => mutation.mutate()} disabled={!appointmentId}>
        Complete Consultation
      </Button>
    </Card>
  )
}
