import { useState } from 'react'
import { Banknote, CreditCard, Wallet } from 'lucide-react'
import PaymentForm from '../components/billing/PaymentForm'
import { CrudPage } from '../components/ui/CrudPage'
import { Button } from '../components/ui/button'
import { StatCard, StatusPill } from '../components/ui/PageShell'
import { useBillings } from '../hooks/useEntityOptions'
import { useDashboardStats } from '../hooks/useDashboardStats'

export default function Payments() {
  const [open, setOpen] = useState(false)
  const { data: stats, isLoading } = useDashboardStats()
  const billings = useBillings()
  const billingById = new Map((billings.data ?? []).map((b) => [b.id, b]))

  return (
    <>
      <CrudPage
        title="Payments"
        description="Record and view patient payments linked to billing."
        resource="Payment"
        headerAction={
          <Button variant="accent" onClick={() => setOpen(true)}>
            + Record Payment
          </Button>
        }
        metrics={
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <StatCard label="Total Collected" value={isLoading ? '…' : `₱${(stats?.totalRevenue ?? 0).toLocaleString('en-PH')}`} tone="success" icon={<Wallet className="h-5 w-5" />} />
            <StatCard label="Pending Bills" value={isLoading ? '…' : (stats?.pendingBills ?? 0)} tone="warning" icon={<Banknote className="h-5 w-5" />} />
            <StatCard label="Dispensed Today" value={isLoading ? '…' : (stats?.dispensedToday ?? 0)} tone="info" icon={<CreditCard className="h-5 w-5" />} />
          </div>
        }
        columns={[
          {
            title: 'Billing',
            dataIndex: 'billingId',
            render: (v) => {
              const b = billingById.get(String(v))
              return (
                <div>
                  <p className="font-medium text-slate-900">INV-{String(v).slice(0, 8).toUpperCase()}</p>
                  {b && <StatusPill variant={b.status === 'Paid' ? 'success' : 'warning'}>{b.status}</StatusPill>}
                </div>
              )
            },
          },
          { title: 'Amount Paid', dataIndex: 'amountPaid', render: (v) => `₱${Number(v ?? 0).toFixed(2)}` },
          { title: 'Method', dataIndex: 'method' },
          { title: 'Reference', dataIndex: 'transactionRef' },
        ]}
      />
      <PaymentForm open={open} onOpenChange={setOpen} />
    </>
  )
}
