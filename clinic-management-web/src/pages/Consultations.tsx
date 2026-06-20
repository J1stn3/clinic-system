import { Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import ClinicalWizard from '../components/consultation/ClinicalWizard'
import { CrudPage } from '../components/ui/CrudPage'
import { PageShell, StatusPill } from '../components/ui/PageShell'
import { Button } from '../components/ui/button'
import { usePatients } from '../hooks/useEntityOptions'
import { authStore } from '../stores/authStore'

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
