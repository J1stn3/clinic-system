import { Plus, Send, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { CrudPage } from '../components/ui/CrudPage'
import { Card, StatusPill } from '../components/ui/PageShell'
import { Button } from '../components/ui/button'
import { usePatients } from '../hooks/useEntityOptions'
import { authStore } from '../stores/authStore'

const MEDICATIONS = [
  { name: 'Amlodipine', dosage: '5mg', class: 'Calcium Channel Blocker' },
  { name: 'Lisinopril', dosage: '10mg', class: 'ACE Inhibitor' },
  { name: 'Metformin', dosage: '500mg', class: 'Antidiabetic' },
  { name: 'Atorvastatin', dosage: '10mg', class: 'Statin' },
  { name: 'Amoxicillin', dosage: '500mg', class: 'Antibiotic', allergy: true },
]

export default function Prescriptions() {
  const [selected, setSelected] = useState<string | null>('Amlodipine 5mg')
  const patients = usePatients()
  const patientNameById = new Map((patients.data ?? []).map((p) => [p.id, p.fullName ?? p.id]))
  const patientOptions = (patients.data ?? []).map((p) => ({
    value: p.id,
    label: p.fullName ?? p.id,
  }))

  return (
    <CrudPage
      title="E-Prescription"
      description="Create and manage prescriptions for your patients."
      resource="Prescription"
      canCreate={authStore.role === 'Doctor'}
      createLabel="Issue Prescription"
      headerAction={
        authStore.role === 'Doctor' ? (
          <Button variant="accent" className="w-full sm:w-auto">
            <Send className="mr-2 h-4 w-4" />
            Issue Prescription
          </Button>
        ) : undefined
      }
      metrics={
        authStore.role === 'Doctor' ? (
          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <h3 className="mb-3 font-semibold text-slate-900">Medication Search</h3>
              <input type="search" placeholder="Search medications..." className="aicare-input mb-4" />
              <div className="space-y-2">
                {MEDICATIONS.map((med) => (
                  <div
                    key={med.name}
                    className="flex flex-col gap-3 rounded-xl border border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">{med.name} {med.dosage}</p>
                      <p className="text-xs text-slate-500">Tablet · {med.class}</p>
                      {med.allergy && <StatusPill variant="warning">Allergy Risk</StatusPill>}
                    </div>
                    <button
                      type="button"
                      className="self-end rounded-lg bg-teal-50 p-2 text-aicare-teal hover:bg-teal-100 sm:self-center"
                      onClick={() => setSelected(`${med.name} ${med.dosage}`)}
                      aria-label={`Add ${med.name}`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              {selected && (
                <div className="mt-4 flex items-center justify-between rounded-xl bg-teal-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-800">{selected}</span>
                  <button type="button" onClick={() => setSelected(null)} aria-label="Remove">
                    <Trash2 className="h-4 w-4 text-slate-500" />
                  </button>
                </div>
              )}
            </Card>
            <Card>
              <h3 className="mb-3 font-semibold text-slate-900">Prescription Preview</h3>
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm">
                <p className="font-semibold text-aicare-teal">AiCare Clinic Suite</p>
                <p className="mt-2 text-slate-600">Rx {selected ?? '—'}</p>
                <p className="mt-1 text-xs text-slate-500">Once daily · 30 days</p>
              </div>
              <h4 className="mb-2 mt-4 text-sm font-medium text-slate-700">Prescription History</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>RX-2041</span>
                  <StatusPill variant="success">Active</StatusPill>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>RX-1987</span>
                  <StatusPill variant="default">Completed</StatusPill>
                </div>
              </div>
            </Card>
          </div>
        ) : undefined
      }
      columns={[
        { title: 'Patient', dataIndex: 'patientId', render: (v) => patientNameById.get(String(v)) ?? String(v) },
        { title: 'Medication', dataIndex: 'medication' },
        { title: 'Dosage', dataIndex: 'dosage' },
        { title: 'Instructions', dataIndex: 'instructions' },
      ]}
      fields={[
        { name: 'patientId', label: 'Patient', type: 'select', options: patientOptions },
        { name: 'medication', label: 'Medication' },
        { name: 'dosage', label: 'Dosage' },
        { name: 'instructions', label: 'Instructions' },
      ]}
    />
  )
}
