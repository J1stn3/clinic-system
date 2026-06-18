import { Link } from 'react-router-dom'
import { Monitor, Users, Video } from 'lucide-react'
import { CrudPage } from '../components/ui/CrudPage'
import { Button } from '../components/ui/button'
import { StatCard, StatusPill } from '../components/ui/PageShell'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { useAppointments } from '../hooks/useEntityOptions'

export default function Telemedicine() {
  const { data: stats, isLoading } = useDashboardStats()
  const appointments = useAppointments()
  const appointmentById = new Map((appointments.data ?? []).map((a) => [a.id, a]))

  return (
    <CrudPage
      title="Telemedicine"
      description="Manage virtual consultation sessions and meeting links."
      resource="Telemedicine"
      headerAction={
        <Link to="/appointments">
          <Button variant="accent">Book Virtual Visit</Button>
        </Link>
      }
      metrics={
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="Active Sessions" value={isLoading ? '…' : (stats?.telemedicineSessions ?? 0)} tone="info" icon={<Video className="h-5 w-5" />} />
          <StatCard label="Upcoming Virtual" value={isLoading ? '…' : (stats?.upcomingAppointments ?? 0)} tone="success" icon={<Monitor className="h-5 w-5" />} />
          <StatCard label="Patients Online" value={isLoading ? '…' : (stats?.patients ?? 0)} tone="default" icon={<Users className="h-5 w-5" />} />
        </div>
      }
      columns={[
        {
          title: 'Appointment',
          dataIndex: 'appointmentId',
          render: (v) => {
            const apt = appointmentById.get(String(v))
            return (
              <div>
                <p className="font-medium text-slate-900">{apt?.patientName ?? 'Patient'}</p>
                <p className="text-xs text-slate-500">{(apt as { doctorName?: string }).doctorName ?? 'Doctor'}</p>
              </div>
            )
          },
        },
        {
          title: 'Meeting',
          dataIndex: 'meetingUrl',
          render: (url) =>
            url ? (
              <a
                href={String(url)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-lg bg-aicare-teal px-3 py-1.5 text-sm font-medium text-white hover:bg-aicare-teal/90"
              >
                Join Session
              </a>
            ) : (
              '—'
            ),
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
