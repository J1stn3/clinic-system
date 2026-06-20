import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import AppointmentForm from '../components/appointment/AppointmentForm'
import { CrudPage } from '../components/ui/CrudPage'
import { Card, StatCard, StatusPill } from '../components/ui/PageShell'
import { Button } from '../components/ui/button'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { usePatients } from '../hooks/useEntityOptions'
import { api } from '../services/api'
import { authStore } from '../stores/authStore'

function statusVariant(status: string) {
  const s = status.toLowerCase()
  if (s.includes('confirm')) return 'success' as const
  if (s.includes('progress')) return 'info' as const
  if (s.includes('cancel')) return 'danger' as const
  return 'warning' as const
}

type AppointmentRow = {
  id: string
  isVirtual?: boolean
  meetingUrl?: string
  telemedicineStatus?: string
  patientName?: string
  doctorName?: string
  scheduledAt?: string
  status?: string
  notes?: string
}

export default function Appointments() {
  const [showBook, setShowBook] = useState(false)
  const [tab, setTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')
  const { data: stats, isLoading } = useDashboardStats()
  const role = authStore.role
  const patients = usePatients()

  const doctors = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => (await api.get('/Doctor', { params: { page: 1, pageSize: 50 } })).data.items,
    enabled: role !== 'Doctor',
  })

  const canBook = role === 'Patient' || role === 'Administrator' || role === 'Doctor'
  const bookingReady =
    role === 'Patient'
      ? Boolean(doctors.data)
      : role === 'Administrator'
        ? Boolean(doctors.data && patients.data)
        : Boolean(patients.data)

  const headerAction = canBook ? (
    <Button variant="accent" className="w-full sm:w-auto" onClick={() => setShowBook(true)}>
      + New Booking
    </Button>
  ) : undefined

  const filterRows = (items: AppointmentRow[]) => {
    const now = new Date()
    if (tab === 'upcoming') {
      return items.filter((a) => {
        const d = a.scheduledAt ? new Date(a.scheduledAt) : null
        return d && d >= now && a.status?.toLowerCase() !== 'cancelled'
      })
    }
    if (tab === 'cancelled') {
      return items.filter((a) => a.status?.toLowerCase() === 'cancelled')
    }
    // past: scheduled date has passed and not cancelled
    return items.filter((a) => {
      const d = a.scheduledAt ? new Date(a.scheduledAt) : null
      return d && d < now && a.status?.toLowerCase() !== 'cancelled'
    })
  }

  return (
    <>
      <CrudPage
        title="Appointments"
        description="Book, view, and manage clinic appointments."
        resource="Appointment"
        headerAction={headerAction}
        filterRows={filterRows}
        canEdit={role !== 'Patient'}
        canDelete={role === 'Administrator'}
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
              <StatCard
                label="Virtual Upcoming"
                value={isLoading ? '…' : (stats?.upcomingVirtualAppointments ?? 0)}
                tone="success"
              />
            </div>
            <Card className="lg:col-span-3">
              <div className="aicare-tabs-scroll mb-4">
                {(['upcoming', 'past', 'cancelled'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={tab === t ? 'aicare-tab-active capitalize' : 'aicare-tab capitalize'}
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
            title: 'Date & Time',
            dataIndex: 'scheduledAt',
            render: (v, record) => {
              const row = record as AppointmentRow
              const dateStr = String(row.scheduledAt ?? v ?? '')
              const d = dateStr ? new Date(dateStr) : null
              return (
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-teal-50 text-aicare-teal sm:h-14 sm:w-14">
                    <span className="text-[10px] font-bold uppercase">{d ? d.toLocaleString(undefined, { month: 'short' }) : '—'}</span>
                    <span className="text-lg font-bold leading-none">{d ? d.getDate() : '—'}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{row.patientName ?? 'Patient'}</p>
                    <p className="text-xs text-slate-500">
                      {row.doctorName ?? 'Doctor'}
                      {d ? ` · ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}` : ''}
                    </p>
                  </div>
                </div>
              )
            },
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
          {
            title: 'Video',
            dataIndex: 'meetingUrl',
            render: (_v, record) => {
              const row = record as AppointmentRow
              if (!row.isVirtual) return '—'
              if (row.meetingUrl) {
                return (
                  <Link
                    to={`/telemedicine/room/${row.id}`}
                    className="text-sm font-semibold text-aicare-teal hover:underline"
                  >
                    Join
                  </Link>
                )
              }
              return <span className="text-xs text-slate-400">Pending</span>
            },
          },
          { title: 'Notes', dataIndex: 'notes' },
        ]}
        fields={
          role !== 'Patient'
            ? [
                { name: 'status', label: 'Status' },
                { name: 'notes', label: 'Notes' },
              ]
            : []
        }
      />
      {showBook && bookingReady && (
        <AppointmentForm
          doctors={doctors.data ?? []}
          patients={patients.data}
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
