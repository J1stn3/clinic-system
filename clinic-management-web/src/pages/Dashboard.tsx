import {
  Activity,
  Calendar,
  CreditCard,
  Download,
  Stethoscope,
  Users,
  Video,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '../components/ui/button'
import { AvatarInitials, Card, PageShell, StatCard, StatusPill } from '../components/ui/PageShell'
import { formatNextAppointment, useDashboardStats } from '../hooks/useDashboardStats'
import { api } from '../services/api'
import { authStore } from '../stores/authStore'

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats()
  const isPatient = authStore.role === 'Patient'
  const isAdmin = authStore.role === 'Administrator'
  const firstName = authStore.fullName?.split(' ')[0] ?? 'there'

  const recentPatients = useQuery({
    queryKey: ['patients', 'recent'],
    queryFn: async () => (await api.get('/Patient', { params: { page: 1, pageSize: 5 } })).data.items,
    enabled: !isPatient,
  })

  const recentAppointments = useQuery({
    queryKey: ['appointments', 'recent'],
    queryFn: async () => (await api.get('/Appointment', { params: { page: 1, pageSize: 5 } })).data.items,
    enabled: !isPatient,
  })

  if (isPatient) {
    return (
      <PageShell
        title={`Welcome back, ${firstName}`}
        description="Your health summary and upcoming care at a glance."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Next Appointment"
            value={isLoading ? '…' : formatNextAppointment(stats?.nextAppointmentAt)}
            tone="info"
            icon={<Calendar className="h-5 w-5" />}
          />
          <StatCard
            label="Active Prescriptions"
            value={isLoading ? '…' : (stats?.prescriptions ?? 0)}
            tone="success"
            icon={<Activity className="h-5 w-5" />}
          />
          <StatCard
            label="Pending Lab Results"
            value={isLoading ? '…' : (stats?.pendingLabTests ?? 0)}
            tone="warning"
            icon={<Activity className="h-5 w-5" />}
          />
        </div>

        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Health Summary</h3>
              <p className="mt-2 text-sm text-slate-500">
                Use the AIcare Assistant (bottom-right) to ask about appointments, prescriptions, or lab results.
              </p>
            </div>
            <Link to="/telemedicine">
              <Button variant="accent">Join Telemedicine</Button>
            </Link>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-slate-700">Quick actions</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to="/appointments"><Button variant="outline" size="sm">Appointments</Button></Link>
                <Link to="/prescriptions"><Button variant="outline" size="sm">Prescriptions</Button></Link>
                <Link to="/laboratory"><Button variant="outline" size="sm">Lab Results</Button></Link>
                <Link to="/billing"><Button variant="outline" size="sm">Billing</Button></Link>
              </div>
            </div>
            <div className="rounded-xl bg-teal-50 p-4">
              <p className="text-sm font-medium text-slate-700">AIcare Assistant</p>
              <p className="mt-1 text-sm text-slate-600">
                Tap the floating teal button to open your personal health assistant — available for patients only.
              </p>
            </div>
          </div>
        </Card>
      </PageShell>
    )
  }

  const growthData = [
    { month: 'Jan', patients: Math.max(1, (stats?.patients ?? 10) - 50) },
    { month: 'Feb', patients: Math.max(1, (stats?.patients ?? 10) - 40) },
    { month: 'Mar', patients: Math.max(1, (stats?.patients ?? 10) - 30) },
    { month: 'Apr', patients: Math.max(1, (stats?.patients ?? 10) - 20) },
    { month: 'May', patients: Math.max(1, (stats?.patients ?? 10) - 10) },
    { month: 'Jun', patients: stats?.patients ?? 0 },
  ]

  const appointmentTrends = [
    { day: 'Mon', inPerson: Math.round((stats?.appointmentsToday ?? 4) * 1.1), virtual: Math.round((stats?.upcomingAppointments ?? 2) * 0.4) },
    { day: 'Tue', inPerson: Math.round((stats?.appointmentsToday ?? 4) * 0.9), virtual: Math.round((stats?.upcomingAppointments ?? 2) * 0.5) },
    { day: 'Wed', inPerson: stats?.appointmentsToday ?? 0, virtual: stats?.upcomingAppointments ?? 0 },
    { day: 'Thu', inPerson: Math.round((stats?.appointmentsToday ?? 4) * 1.2), virtual: Math.round((stats?.upcomingAppointments ?? 2) * 0.6) },
    { day: 'Fri', inPerson: Math.round((stats?.appointmentsToday ?? 4) * 1.3), virtual: Math.round((stats?.upcomingAppointments ?? 2) * 0.3) },
    { day: 'Sat', inPerson: Math.max(1, Math.round((stats?.appointmentsToday ?? 2) * 0.5)), virtual: 1 },
    { day: 'Sun', inPerson: 1, virtual: 1 },
  ]

  const dashStats = [
    { label: 'Total Patients', value: stats?.patients ?? 0, icon: <Users className="h-5 w-5" />, tone: 'info' as const },
    { label: 'Total Doctors', value: stats?.doctors ?? 0, icon: <Stethoscope className="h-5 w-5" />, tone: 'default' as const },
    { label: 'Appointments Today', value: stats?.appointmentsToday ?? 0, icon: <Calendar className="h-5 w-5" />, tone: 'info' as const },
    { label: 'Active Consultations', value: stats?.activeConsultations ?? stats?.consultations ?? 0, icon: <Activity className="h-5 w-5" />, tone: 'success' as const },
  ]

  return (
    <PageShell
      title="Executive Dashboard"
      description={`Welcome back, ${firstName}. Here's what's happening today.`}
      action={
        <div className="flex gap-2">
          <Link to="/reports">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </Link>
          <Link to="/appointments">
            <Button variant="accent">New Appointment</Button>
          </Link>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashStats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={isLoading ? '…' : stat.value}
            icon={stat.icon}
            tone={stat.tone}
          />
        ))}
      </div>

      {isAdmin && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Revenue Today"
            value={isLoading ? '…' : `₱${(stats?.totalRevenue ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 0 })}`}
            tone="success"
            icon={<CreditCard className="h-5 w-5" />}
          />
          <StatCard
            label="Telemedicine Sessions"
            value={isLoading ? '…' : (stats?.telemedicineSessions ?? 0)}
            tone="info"
            icon={<Video className="h-5 w-5" />}
          />
          <StatCard
            label="AI Analyses"
            value={isLoading ? '…' : (stats?.aiAnalyses ?? 0)}
            tone="success"
            icon={<Activity className="h-5 w-5" />}
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-1 font-semibold text-slate-900">Patient Growth</h3>
          <p className="mb-4 text-xs text-slate-500">Patient registrations · Jan–Jun 2026</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="patients" stroke="#0D9488" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="mb-1 font-semibold text-slate-900">Appointment Trends</h3>
          <p className="mb-4 text-xs text-slate-500">In-person vs virtual · This week</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentTrends}>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="inPerson" stackId="a" fill="#0D9488" />
                <Bar dataKey="virtual" stackId="a" fill="#0284C7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {!isPatient && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Recent Patients</h3>
              <Link to="/patients" className="text-sm font-medium text-aicare-teal">View All</Link>
            </div>
            <div className="space-y-3">
              {(recentPatients.data ?? []).map((p: { id: string; fullName?: string; gender?: string }) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <AvatarInitials name={p.fullName ?? 'P'} />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{p.fullName ?? 'Patient'}</p>
                      <p className="text-xs text-slate-500">{p.gender ?? '—'}</p>
                    </div>
                  </div>
                  <StatusPill variant="success">Active</StatusPill>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Recent Appointments</h3>
              <Link to="/appointments" className="text-sm font-medium text-aicare-teal">View All</Link>
            </div>
            <div className="space-y-3">
              {(recentAppointments.data ?? []).map((a: { id: string; patientName?: string; status?: string; scheduledAt?: string }) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{a.patientName ?? 'Patient'}</p>
                    <p className="text-xs text-slate-500">{a.scheduledAt ? String(a.scheduledAt).slice(0, 16) : '—'}</p>
                  </div>
                  <StatusPill variant={String(a.status).toLowerCase().includes('complete') ? 'success' : 'info'}>
                    {a.status ?? 'Scheduled'}
                  </StatusPill>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <Card>
        <h3 className="mb-4 font-semibold text-slate-900">Quick Actions</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'Register New Patient', to: '/patients' },
            { label: 'Schedule Appointment', to: '/appointments' },
            { label: 'Create Medical Record', to: '/medical-records' },
            { label: 'Write Prescription', to: '/prescriptions' },
            { label: 'Order Lab Test', to: '/laboratory' },
          ].map((action) => (
            <Link key={action.to} to={action.to}>
              <Button variant="outline" className="w-full justify-start">
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </Card>
    </PageShell>
  )
}
