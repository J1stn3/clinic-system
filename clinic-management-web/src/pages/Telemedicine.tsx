import { Link } from 'react-router-dom'
import { Calendar, Monitor, Video } from 'lucide-react'
import { CrudPage } from '../components/ui/CrudPage'
import { Button } from '../components/ui/button'
import { StatCard, StatusPill } from '../components/ui/PageShell'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { authStore } from '../stores/authStore'

type TelemedicineRow = {
  id: string
  appointmentId: string
  meetingUrl?: string
  status: string
  patientName?: string
  doctorName?: string
  scheduledAt?: string
}

export default function Telemedicine() {
  const { data: stats, isLoading } = useDashboardStats()
  const role = authStore.role

  const headerAction =
    role === 'Patient' ? (
      <Link to="/appointments">
        <Button variant="accent">Book Virtual Visit</Button>
      </Link>
    ) : role === 'Doctor' ? (
      <Link to="/consultations">
        <Button variant="accent">Start Consultation</Button>
      </Link>
    ) : (
      <Link to="/appointments">
        <Button variant="accent">Schedule Virtual Visit</Button>
      </Link>
    )

  return (
    <CrudPage
      title="Telemedicine"
      description="Manage virtual consultation sessions and join video rooms."
      resource="Telemedicine"
      headerAction={headerAction}
      metrics={
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Active Sessions"
            value={isLoading ? '…' : (stats?.activeTelemedicineSessions ?? 0)}
            tone="info"
            icon={<Video className="h-5 w-5" />}
          />
          <StatCard
            label="Upcoming Virtual"
            value={isLoading ? '…' : (stats?.upcomingVirtualAppointments ?? 0)}
            tone="success"
            icon={<Monitor className="h-5 w-5" />}
          />
          <StatCard
            label="Total Sessions"
            value={isLoading ? '…' : (stats?.telemedicineSessions ?? 0)}
            tone="default"
            icon={<Calendar className="h-5 w-5" />}
          />
        </div>
      }
      columns={[
        {
          title: 'Appointment',
          dataIndex: 'patientName',
          render: (_v, record) => {
            const row = record as TelemedicineRow
            return (
              <div>
                <p className="font-medium text-slate-900">{row.patientName ?? 'Patient'}</p>
                <p className="text-xs text-slate-500">
                  Dr. {row.doctorName ?? 'Doctor'}
                  {row.scheduledAt
                    ? ` · ${new Date(row.scheduledAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`
                    : ''}
                </p>
              </div>
            )
          },
        },
        {
          title: 'Meeting',
          dataIndex: 'appointmentId',
          render: (v, record) => {
            const row = record as TelemedicineRow
            const appointmentId = String(v ?? row.appointmentId)
            if (!appointmentId) return '—'
            return (
              <Link
                to={`/telemedicine/room/${appointmentId}`}
                className="inline-flex items-center rounded-lg bg-aicare-teal px-3 py-1.5 text-sm font-medium text-white hover:bg-aicare-teal/90"
              >
                Join Session
              </Link>
            )
          },
        },
        {
          title: 'Status',
          dataIndex: 'status',
          render: (v) => (
            <StatusPill variant={String(v).toLowerCase() === 'completed' ? 'success' : 'info'}>{String(v)}</StatusPill>
          ),
        },
      ]}
    />
  )
}
