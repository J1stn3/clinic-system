import { useState } from 'react'
import { AlertTriangle, Pill } from 'lucide-react'
import { CrudPage } from '../components/ui/CrudPage'
import { Card, StatusPill } from '../components/ui/PageShell'
import { Button } from '../components/ui/button'
import { usePatients } from '../hooks/useEntityOptions'
import { authStore } from '../stores/authStore'

const TABS = ['Summary', 'Diagnoses', 'Immunizations', 'Attachments'] as const

export default function MedicalRecords() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Summary')
  const patients = usePatients()
  const patientNameById = new Map((patients.data ?? []).map((p) => [p.id, p.fullName ?? p.id]))
  const patientOptions = (patients.data ?? []).map((p) => ({
    value: p.id,
    label: p.fullName ?? p.id,
  }))

  return (
    <CrudPage
      title="Medical Records"
      description="View patient history, vitals, and clinical documentation."
      resource="MedicalRecord"
      canCreate={authStore.role === 'Doctor'}
      createLabel="New Record"
      headerAction={
        <div className="aicare-page-actions">
          <Button variant="outline" className="w-full sm:w-auto">Print</Button>
          <Button variant="accent" className="w-full sm:w-auto">Export</Button>
        </div>
      }
      metrics={
        <>
          <div className="aicare-tabs-scroll mb-4">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={tab === t ? 'aicare-tab-active' : 'aicare-tab'}
              >
                {t}
              </button>
            ))}
          </div>
          {tab === 'Summary' && (
            <div className="mb-6 grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <h3 className="mb-4 font-semibold text-slate-900">Patient Summary</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    { label: 'Blood Group', value: 'O+' },
                    { label: 'Height', value: '—' },
                    { label: 'Weight', value: '—' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className="text-sm font-semibold text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>
                <h4 className="mb-3 mt-6 font-medium text-slate-800">Medical Timeline</h4>
                <div className="space-y-4 border-l-2 border-teal-100 pl-4">
                  <div>
                    <p className="text-xs text-slate-500">Recent visit</p>
                    <p className="text-sm font-medium text-slate-900">Consultation notes from your care team</p>
                  </div>
                </div>
              </Card>
              <div className="space-y-4">
                <Card>
                  <div className="mb-2 flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <h3 className="font-semibold">Allergies</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill variant="danger">Penicillin</StatusPill>
                    <StatusPill variant="danger">Sulfa Drugs</StatusPill>
                  </div>
                </Card>
                <Card>
                  <div className="mb-2 flex items-center gap-2 text-slate-800">
                    <Pill className="h-4 w-4 text-blue-500" />
                    <h3 className="font-semibold">Current Medications</h3>
                  </div>
                  <p className="text-sm text-slate-500">See Prescriptions module for active medications.</p>
                </Card>
              </div>
            </div>
          )}
        </>
      }
      columns={[
        { title: 'Patient', dataIndex: 'patientId', render: (v) => patientNameById.get(String(v)) ?? String(v) },
        { title: 'History', dataIndex: 'history' },
        { title: 'Vitals', dataIndex: 'vitals' },
      ]}
      fields={[
        { name: 'patientId', label: 'Patient', type: 'select', options: patientOptions },
        { name: 'history', label: 'History' },
        { name: 'vitals', label: 'Vitals' },
      ]}
    />
  )
}
