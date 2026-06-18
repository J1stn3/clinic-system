import { Activity, Heart, Thermometer, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import ClinicalWizard from '../components/consultation/ClinicalWizard'
import { CrudPage } from '../components/ui/CrudPage'
import { Card, PageShell, StatusPill } from '../components/ui/PageShell'
import { Button } from '../components/ui/button'
import { usePatients } from '../hooks/useEntityOptions'
import { authStore } from '../stores/authStore'

const VITALS = [
  { label: 'Heart Rate', value: '82 bpm', icon: Heart, bg: 'bg-rose-50 text-rose-600' },
  { label: 'Blood Pressure', value: '120/80', icon: Activity, bg: 'bg-amber-50 text-amber-600' },
  { label: 'Temperature', value: '36.8 °C', icon: Thermometer, bg: 'bg-orange-50 text-orange-600' },
  { label: 'SpO2', value: '98%', icon: Activity, bg: 'bg-sky-50 text-sky-600' },
]

export default function Consultations() {
  const patients = usePatients()
  const patientNameById = new Map((patients.data ?? []).map((p) => [p.id, p.fullName ?? p.id]))
  const isDoctor = authStore.role === 'Doctor'

  if (isDoctor) {
    return (
      <PageShell
        title="Consultations"
        description="Active patient consultation workspace"
        action={
          <div className="aicare-page-actions">
            <Link to="/telemedicine" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                <Video className="mr-2 h-4 w-4" />
                Telemedicine Sessions
              </Button>
            </Link>
          </div>
        }
      >
        <div className="aicare-metric-grid">
          {VITALS.map((vital) => {
            const Icon = vital.icon
            return (
              <Card key={vital.label} className="!p-4 transition-shadow hover:shadow-md">
                <div className={`mb-2 inline-flex rounded-lg p-2 ${vital.bg}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-xs font-medium text-slate-500">{vital.label}</p>
                <p className="text-xl font-bold text-slate-900">{vital.value}</p>
              </Card>
            )
          })}
        </div>
        <ClinicalWizard />
      </PageShell>
    )
  }

  return (
    <CrudPage
      title="Consultations"
      description="Document symptoms, diagnoses, and clinical encounters."
      resource="Consultation"
      canCreate={false}
      canEdit={false}
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
  )
}
