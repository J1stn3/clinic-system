import { Activity, Heart, Thermometer } from 'lucide-react'
import ClinicalWizard from '../components/consultation/ClinicalWizard'
import { CrudPage } from '../components/ui/CrudPage'
import { Card, StatusPill } from '../components/ui/PageShell'
import { Button } from '../components/ui/button'
import { usePatients } from '../hooks/useEntityOptions'
import { authStore } from '../stores/authStore'

export default function Consultations() {
  const patients = usePatients()
  const patientNameById = new Map((patients.data ?? []).map((p) => [p.id, p.fullName ?? p.id]))

  return (
    <>
      {authStore.role === 'Doctor' && (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Consultations</h1>
              <p className="text-sm text-slate-500">Active patient consultation workspace</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Pause Session</Button>
              <Button variant="accent">Save & Complete</Button>
            </div>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Heart Rate', value: '82 bpm', icon: <Heart className="h-4 w-4" />, bg: 'bg-rose-50 text-rose-600' },
              { label: 'Blood Pressure', value: '—', icon: <Activity className="h-4 w-4" />, bg: 'bg-amber-50 text-amber-600' },
              { label: 'Temperature', value: '—', icon: <Thermometer className="h-4 w-4" />, bg: 'bg-orange-50 text-orange-600' },
              { label: 'SpO2', value: '—', icon: <Activity className="h-4 w-4" />, bg: 'bg-sky-50 text-sky-600' },
            ].map((vital) => (
              <Card key={vital.label} className="!p-4">
                <div className={`mb-2 inline-flex rounded-lg p-2 ${vital.bg}`}>{vital.icon}</div>
                <p className="text-xs text-slate-500">{vital.label}</p>
                <p className="text-lg font-bold text-slate-900">{vital.value}</p>
              </Card>
            ))}
          </div>

          <ClinicalWizard />
        </>
      )}

      <CrudPage
        title={authStore.role === 'Doctor' ? 'Consultation Records' : 'Consultations'}
        description="Document symptoms, diagnoses, and clinical encounters."
        resource="Consultation"
        embedded={authStore.role === 'Doctor'}
        canCreate={authStore.role === 'Doctor'}
        canEdit={authStore.role === 'Doctor'}
        columns={[
          {
            title: 'Patient',
            dataIndex: 'patientId',
            render: (v) => patientNameById.get(String(v)) ?? String(v),
          },
          { title: 'Symptoms', dataIndex: 'symptoms' },
          {
            title: 'Diagnosis',
            dataIndex: 'diagnosis',
            render: (v) => (
              <div>
                <p className="font-medium text-slate-900">{String(v)}</p>
                <StatusPill variant="info">ICD-10</StatusPill>
              </div>
            ),
          },
        ]}
        fields={[
          { name: 'appointmentId', label: 'Appointment ID' },
          { name: 'symptoms', label: 'Symptoms' },
          { name: 'diagnosis', label: 'Diagnosis' },
        ]}
      />
    </>
  )
}
