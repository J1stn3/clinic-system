import { CreditCard, Receipt, Wallet } from 'lucide-react'
import { CrudPage } from '../components/ui/CrudPage'
import { StatCard, StatusPill } from '../components/ui/PageShell'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { usePatients } from '../hooks/useEntityOptions'
import { authStore } from '../stores/authStore'

function billStatusVariant(status: string) {
  const s = status.toLowerCase()
  if (s === 'paid') return 'success' as const
  if (s === 'partial') return 'warning' as const
  if (s === 'pending') return 'default' as const
  return 'danger' as const
}

export default function Billing() {
  const { data: stats, isLoading } = useDashboardStats()
  const patients = usePatients()
  const patientNameById = new Map((patients.data ?? []).map((p) => [p.id, p.fullName ?? p.id]))
  const patientOptions = (patients.data ?? []).map((p) => ({
    value: p.id,
    label: p.fullName ?? p.id,
  }))

  return (
    <CrudPage
      title="Billing & Payments"
      description="Track patient bills, invoices, and payment status."
      resource="Billing"
      canCreate={authStore.role === 'Administrator'}
      createLabel="New Bill"
      metrics={
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="Pending Bills" value={isLoading ? '…' : (stats?.pendingBills ?? 0)} tone="warning" icon={<Receipt className="h-5 w-5" />} />
          <StatCard label="Total Revenue" value={isLoading ? '…' : `₱${(stats?.totalRevenue ?? 0).toLocaleString('en-PH')}`} tone="success" icon={<Wallet className="h-5 w-5" />} />
          <StatCard label="Patients Billed" value={isLoading ? '…' : (stats?.patients ?? 0)} tone="info" icon={<CreditCard className="h-5 w-5" />} />
        </div>
      }
      columns={[
        {
          title: 'Patient',
          dataIndex: 'patientId',
          render: (v) => (
            <span className="font-medium text-slate-900">{patientNameById.get(String(v)) ?? String(v)}</span>
          ),
        },
        { title: 'Amount', dataIndex: 'amount', render: (v) => `₱${Number(v ?? 0).toFixed(2)}` },
        { title: 'Paid', dataIndex: 'amountPaid', render: (v) => `₱${Number(v ?? 0).toFixed(2)}` },
        {
          title: 'Balance',
          dataIndex: 'amount',
          render: (_v, record) => {
            const amount = Number((record as { amount?: number }).amount ?? 0)
            const paid = Number((record as { amountPaid?: number }).amountPaid ?? 0)
            return `₱${Math.max(0, amount - paid).toFixed(2)}`
          },
        },
        {
          title: 'Status',
          dataIndex: 'status',
          render: (v) => <StatusPill variant={billStatusVariant(String(v))}>{String(v)}</StatusPill>,
        },
      ]}
      fields={[
        { name: 'patientId', label: 'Patient', type: 'select', options: patientOptions },
        { name: 'amount', label: 'Amount', type: 'number' },
      ]}
    />
  )
}
