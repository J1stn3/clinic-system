import { CheckCircle2, Clock, FlaskConical, ShieldCheck } from 'lucide-react'
import { CrudPage } from '../components/ui/CrudPage'
import { Card, StatCard, StatusPill } from '../components/ui/PageShell'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { usePatients } from '../hooks/useEntityOptions'
import { authStore } from '../stores/authStore'

function labStatusVariant(status: string) {
  const s = status.toLowerCase()
  if (s.includes('verified') || s.includes('completed')) return 'success' as const
  if (s.includes('progress')) return 'warning' as const
  if (s.includes('pending') || s.includes('requested')) return 'default' as const
  return 'info' as const
}

function flagVariant(flag: string) {
  const f = flag.toLowerCase()
  if (f === 'high' || f === 'low') return 'danger' as const
  if (f === 'pending') return 'warning' as const
  return 'success' as const
}

export default function Laboratory() {
  const { data: stats, isLoading } = useDashboardStats()
  const patients = usePatients()
  const patientNameById = new Map((patients.data ?? []).map((p) => [p.id, p.fullName ?? p.id]))
  const patientOptions = (patients.data ?? []).map((p) => ({
    value: p.id,
    label: p.fullName ?? p.id,
  }))

  const latestResults = stats?.latestLabResults ?? []

  return (
    <CrudPage
      title="Laboratory"
      description="Track lab orders, processing workflow, and results verification."
      resource="Laboratory"
      canCreate={authStore.role === 'Doctor' || authStore.role === 'Administrator'}
      canEdit={authStore.role === 'Doctor' || authStore.role === 'Administrator'}
      createLabel="New Lab Order"
      metrics={
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Pending Tests" value={isLoading ? '…' : (stats?.pendingLabTests ?? 0)} tone="warning" icon={<Clock className="h-5 w-5" />} />
            <StatCard label="Active Tests" value={isLoading ? '…' : (stats?.activeLabTests ?? 0)} tone="info" icon={<FlaskConical className="h-5 w-5" />} />
            <StatCard label="Completed Today" value={isLoading ? '…' : (stats?.completedLabToday ?? 0)} tone="success" icon={<CheckCircle2 className="h-5 w-5" />} />
            <StatCard label="Awaiting Verification" value={isLoading ? '…' : (stats?.awaitingLabVerification ?? 0)} tone="info" icon={<ShieldCheck className="h-5 w-5" />} />
          </div>
          {latestResults.length > 0 && (
            <Card className="mb-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Latest Results Preview</h3>
                <span className="text-sm font-medium text-aicare-teal">Full Report →</span>
              </div>
              <div className="space-y-3">
                {latestResults.map((row) => (
                  <div key={row.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{row.name}</p>
                      <p className="text-xs text-slate-500">Ref: {row.referenceRange}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{row.value}</p>
                      <StatusPill variant={flagVariant(row.flag)}>{row.flag}</StatusPill>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      }
      columns={[
        {
          title: 'Order',
          dataIndex: 'patientId',
          render: (v, record) => {
            const name = patientNameById.get(String(v)) ?? String(v)
            return (
              <div>
                <p className="font-medium text-slate-900">LAB-{String((record as { id: string }).id).slice(0, 4).toUpperCase()}</p>
                <p className="text-xs text-slate-500">{name}</p>
              </div>
            )
          },
        },
        { title: 'Test', dataIndex: 'testName' },
        {
          title: 'Priority',
          dataIndex: 'status',
          render: () => <StatusPill variant="default">Routine</StatusPill>,
        },
        {
          title: 'Status',
          dataIndex: 'status',
          render: (v) => (
            <StatusPill variant={labStatusVariant(String(v))}>{String(v)}</StatusPill>
          ),
        },
        { title: 'Result', dataIndex: 'resultValue' },
      ]}
      fields={[
        { name: 'patientId', label: 'Patient', type: 'select', options: patientOptions },
        { name: 'testName', label: 'Test Name' },
        { name: 'resultValue', label: 'Result Value' },
        { name: 'status', label: 'Status' },
      ]}
    />
  )
}
