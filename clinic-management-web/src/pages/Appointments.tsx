import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import AppointmentForm from '../components/appointment/AppointmentForm'
import { CrudPage } from '../components/ui/CrudPage'
import { Card, StatCard, StatusPill } from '../components/ui/PageShell'
import { Button } from '../components/ui/button'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { api } from '../services/api'
import { authStore } from '../stores/authStore'

function statusVariant(status: string) {
  const s = status.toLowerCase()
  if (s.includes('confirm')) return 'success' as const
  if (s.includes('progress')) return 'info' as const
  if (s.includes('cancel')) return 'danger' as const
  return 'warning' as const
}

export default function Appointments() {
  const [showBook, setShowBook] = useState(false)
  const [tab, setTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')
  const { data: stats, isLoading } = useDashboardStats()

  const doctors = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => (await api.get('/Doctor', { params: { page: 1, pageSize: 50 } })).data.items,
    enabled: authStore.role === 'Patient',
  })

  const headerAction =
    authStore.role === 'Patient' ? (
      <Button variant="accent" onClick={() => setShowBook(true)}>
        + New Booking
      </Button>
    ) : (
      <Link to="/appointments">
        <Button variant="accent">+ New Booking</Button>
      </Link>
    )

  return (
    <>
      <CrudPage
        title="Appointments"
        description="Book, view, and manage clinic appointments."
        resource="Appointment"
        headerAction={headerAction}
        canEdit={authStore.role !== 'Patient'}
        canDelete={authStore.role === 'Administrator'}
        metrics={
          <div className="mb-6 grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <h3 className="mb-3 font-semibold text-slate-900">Today</h3>
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-sm font-medium text-slate-600">
                  {new Date().toLocaleString(undefined, { month: 'long', year: 'numeric' })}
                </p>
                <p className="mt-2 text-4xl font-bold text-aicare-teal">{new Date().getDate()}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {isLoading ? '…' : `${stats?.appointmentsToday ?? 0} appointments today`}
                </p>
              </div>
            </Card>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
              <StatCard label="Upcoming" value={isLoading ? '…' : (stats?.upcomingAppointments ?? 0)} tone="info" />
              <StatCard label="Total Scheduled" value={isLoading ? '…' : (stats?.appointments ?? 0)} tone="default" />
            </div>
            <Card className="lg:col-span-3">
              <div className="mb-4 flex gap-4 border-b border-slate-100">
                {(['upcoming', 'past', 'cancelled'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={`border-b-2 pb-2 text-sm font-medium capitalize ${
                      tab === t ? 'border-aicare-teal text-aicare-teal' : 'border-transparent text-slate-500'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <p className="text-sm text-slate-500">
                Showing {tab} appointments below. Use search to filter by patient or doctor.
              </p>
            </Card>
          </div>
        }
        columns={[
          {
            title: 'Appointment',
            dataIndex: 'patientName',
            render: (v, record) => (
              <div>
                <p className="font-semibold text-slate-900">{String(v ?? 'Patient')}</p>
                <p className="text-xs text-slate-500">
                  {String((record as { doctorName?: string }).doctorName ?? 'Doctor')} ·{' '}
                  {String((record as { scheduledAt?: string }).scheduledAt ?? '').slice(0, 16)}
                </p>
              </div>
            ),
          },
          {
            title: 'Type',
            dataIndex: 'isVirtual',
            render: (v) => (
              <StatusPill variant={v ? 'info' : 'default'}>{v ? 'Virtual' : 'In-Person'}</StatusPill>
            ),
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (v) => <StatusPill variant={statusVariant(String(v))}>{String(v)}</StatusPill>,
          },
          { title: 'Notes', dataIndex: 'notes' },
        ]}
        fields={
          authStore.role !== 'Patient'
            ? [
                { name: 'status', label: 'Status' },
                { name: 'notes', label: 'Notes' },
              ]
            : []
        }
      />
      {showBook && doctors.data && (
        <AppointmentForm
          doctors={doctors.data}
          onClose={() => setShowBook(false)}
          onSuccess={() => {
            setShowBook(false)
            toast.success('Appointment booked')
          }}
        />
      )}
    </>
  )
}
