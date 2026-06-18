import { useMutation } from '@tanstack/react-query'
import { AlertTriangle, Package, Pill, TrendingDown } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { DispensePanel } from '../components/pharmacy'
import { CrudPage } from '../components/ui/CrudPage'
import { Card, StatCard, StatusPill } from '../components/ui/PageShell'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { api } from '../services/api'
import { authStore } from '../stores/authStore'

function stockVariant(qty: number) {
  if (qty <= 20) return 'danger' as const
  if (qty <= 80) return 'warning' as const
  return 'success' as const
}

function stockLabel(qty: number) {
  if (qty <= 20) return 'Critical'
  if (qty <= 80) return 'Low Stock'
  return 'In Stock'
}

export default function Pharmacy() {
  const { data: stats, isLoading } = useDashboardStats()
  const [medicineId, setMedicineId] = useState('')
  const [quantity, setQuantity] = useState('1')

  const dispense = useMutation({
    mutationFn: async () =>
      api.post('/Pharmacy/dispense', { medicineId, quantity: Number(quantity) }),
    onSuccess: () => toast.success('Medicine dispensed'),
    onError: () => toast.error('Dispense failed'),
  })

  return (
    <>
      {(authStore.role === 'Administrator' || authStore.role === 'Doctor') && (
        <Card className="mb-6">
          <h3 className="mb-3 font-semibold text-slate-900">Dispense Medicine</h3>
          <DispensePanel
            medicineId={medicineId}
            quantity={quantity}
            onMedicineId={setMedicineId}
            onQuantity={setQuantity}
            onDispense={() => dispense.mutate()}
          />
        </Card>
      )}
      <CrudPage
        title="Pharmacy"
        description="Monitor inventory, stock levels, and dispensing operations."
        resource="Pharmacy"
        canCreate={authStore.role === 'Administrator'}
        createLabel="Add Medicine"
        metrics={
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Items" value={isLoading ? '…' : (stats?.totalMedicines ?? 0)} tone="info" icon={<Package className="h-5 w-5" />} />
            <StatCard label="Low Stock" value={isLoading ? '…' : (stats?.lowStockMedicines ?? 0)} tone="warning" icon={<TrendingDown className="h-5 w-5" />} />
            <StatCard label="Expiring Soon" value={isLoading ? '…' : (stats?.expiringSoonMedicines ?? 0)} tone="danger" icon={<AlertTriangle className="h-5 w-5" />} />
            <StatCard label="Dispensed Today" value={isLoading ? '…' : (stats?.dispensedToday ?? 0)} tone="success" icon={<Pill className="h-5 w-5" />} />
          </div>
        }
        columns={[
          { title: 'Medicine', dataIndex: 'name' },
          { title: 'Category', dataIndex: 'description' },
          {
            title: 'Stock Level',
            dataIndex: 'stockQuantity',
            render: (v) => {
              const qty = Number(v ?? 0)
              const pct = Math.min(100, Math.round((qty / 500) * 100))
              const variant = stockVariant(qty)
              const barColor =
                variant === 'danger' ? 'bg-red-500' : variant === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
              return (
                <div className="flex min-w-[120px] items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{qty}</span>
                </div>
              )
            },
          },
          { title: 'Price', dataIndex: 'unitPrice', render: (v) => `₱${Number(v ?? 0).toFixed(2)}` },
          {
            title: 'Status',
            dataIndex: 'stockQuantity',
            render: (v) => {
              const qty = Number(v ?? 0)
              return <StatusPill variant={stockVariant(qty)}>{stockLabel(qty)}</StatusPill>
            },
          },
        ]}
        fields={[
          { name: 'name', label: 'Name' },
          { name: 'description', label: 'Description' },
          { name: 'unitPrice', label: 'Unit Price', type: 'number' },
          { name: 'stockQuantity', label: 'Stock', type: 'number' },
        ]}
      />
    </>
  )
}
