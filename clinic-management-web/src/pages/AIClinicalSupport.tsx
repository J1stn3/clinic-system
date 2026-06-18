import { zodResolver } from '@hookform/resolvers/zod'
import { Brain } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import CdssResultPanel from '../components/ai/CdssResultPanel'
import { Button } from '../components/ui/button'
import { Input, Label, Textarea } from '../components/ui/input'
import { Card, PageShell } from '../components/ui/PageShell'
import { api } from '../services/api'
import type { CdssResponse } from '../models/types'

const schema = z.object({
  age: z.number().min(0).max(120),
  gender: z.string().min(1),
  symptoms: z.string().min(1),
  history: z.string().optional(),
  vitals: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function AIClinicalSupport() {
  const [patientId, setPatientId] = useState('00000000-0000-0000-0000-000000000001')
  const [result, setResult] = useState<CdssResponse | null>(null)

  const patients = useQuery({
    queryKey: ['patients-cdss'],
    queryFn: async () => (await api.get('/Patient', { params: { page: 1, pageSize: 50 } })).data.items,
  })

  const { register, handleSubmit, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { age: 45, gender: 'Male', symptoms: 'fever, cough, fatigue', history: 'hypertension' },
  })

  const onSubmit = async (values: FormData) => {
    try {
      const payload = {
        age: values.age,
        gender: values.gender,
        symptoms: values.symptoms.split(',').map((s) => s.trim()),
        history: values.history ? values.history.split(',').map((s) => s.trim()) : [],
        vitals: values.vitals ? { bp: values.vitals } : undefined,
      }
      const { data } = await api.post(`/AI/clinical-support/${patientId}`, payload)
      setResult(data.result)
      toast.success('Clinical decision support analysis complete')
    } catch {
      toast.error('CDSS evaluation failed')
    }
  }

  return (
    <PageShell
      title="AI Clinical Decision Support"
      description="Advisory system for doctors. Final medical decisions remain with the physician."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Patient</Label>
              <select
                className="aicare-input"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              >
                {(patients.data ?? []).map((p: { id: string; fullName?: string }) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName ?? p.id}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Age</Label>
                <Input className="aicare-input" type="number" {...register('age', { valueAsNumber: true })} />
              </div>
              <div>
                <Label>Gender</Label>
                <Input className="aicare-input" {...register('gender')} />
              </div>
            </div>
            <div>
              <Label>Symptoms (comma-separated)</Label>
              <Textarea rows={3} {...register('symptoms')} />
            </div>
            <div>
              <Label>Medical History</Label>
              <Input {...register('history')} />
            </div>
            <div>
              <Label>Vitals (optional, e.g. BP 140/90)</Label>
              <Input {...register('vitals')} />
            </div>
            <Button type="submit" disabled={formState.isSubmitting}>
              <Brain className="mr-2 h-4 w-4" />
              Analyze Clinical Data
            </Button>
          </form>
        </Card>
        {result && <CdssResultPanel result={result} />}
      </div>
    </PageShell>
  )
}
