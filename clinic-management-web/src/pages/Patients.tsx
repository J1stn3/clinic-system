import { Filter } from 'lucide-react'
import { CrudPage } from '../components/ui/CrudPage'
import { AvatarInitials, StatCard, StatusPill } from '../components/ui/PageShell'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { authStore } from '../stores/authStore'

function patientStatus(name: string) {
  const n = name.toLowerCase()
  if (n.includes('critical') || n.includes('urgent')) return 'danger' as const
  if (n.includes('inactive')) return 'default' as const
  return 'success' as const
}

export default function Patients() {
  const { data: stats, isLoading } = useDashboardStats()

  return (
    <CrudPage
      title="Patients"
      description="Manage patient records, medical history, and appointments."
      resource="Patient"
      canCreate={authStore.role === 'Administrator'}
      createLabel="Add Patient"
      metrics={
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Registered Patients" value={isLoading ? '…' : (stats?.patients ?? 0)} tone="info" />
          <StatCard label="Appointments Today" value={isLoading ? '…' : (stats?.appointmentsToday ?? 0)} tone="success" />
          <StatCard label="Pending Bills" value={isLoading ? '…' : (stats?.pendingBills ?? 0)} tone="danger" />
          <StatCard label="New This Month" value={isLoading ? '…' : (stats?.newPatientsThisMonth ?? 0)} tone="default" />
        </div>
      }
      columns={[
        {
          title: 'Patient',
          dataIndex: 'fullName',
          render: (v, record) => {
            const name = String(v ?? 'Unknown')
            const dob = (record as { dateOfBirth?: string }).dateOfBirth
            return (
              <div className="flex items-center gap-3">
                <AvatarInitials name={name} />
                <div>
                  <p className="font-semibold text-slate-900">{name}</p>
                  <p className="text-xs text-slate-500">
                    {(record as { id: string }).id.slice(0, 8).toUpperCase()}
                    {dob ? ` · ${dob.slice(0, 10)}` : ''}
                  </p>
                </div>
              </div>
            )
          },
        },
        { title: 'Gender', dataIndex: 'gender' },
        { title: 'Date of Birth', dataIndex: 'dateOfBirth', render: (v) => (v ? String(v).slice(0, 10) : '—') },
        {
          title: 'Status',
          dataIndex: 'fullName',
          render: (v) => <StatusPill variant={patientStatus(String(v))}>Active</StatusPill>,
        },
      ]}
      fields={[
        { name: 'userId', label: 'User ID' },
        { name: 'gender', label: 'Gender' },
      ]}
      extraActions={
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
          aria-label="Filter patients"
        >
          <Filter className="h-4 w-4" />
        </button>
      }
    />
  )
}
