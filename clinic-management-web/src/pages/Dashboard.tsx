import {
  Activity,
  Brain,
  Calendar,
  CreditCard,
  Download,
  FlaskConical,
  Pill,
  Sparkles,
  Stethoscope,
  Users,
  Video,
  Zap,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '../components/ui/button'
import { AvatarInitials, Card, PageShell, StatCard, StatusPill } from '../components/ui/PageShell'
import { formatNextAppointment, useDashboardStats } from '../hooks/useDashboardStats'
import { api } from '../services/api'
import { authStore, type UserRole } from '../stores/authStore'

type QuickAction = {
  label: string
  to: string
  icon: typeof Users
  color: string
  roles: UserRole[]
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Register Patient', to: '/patients', icon: Users, color: 'from-sky-500 to-blue-600', roles: ['Administrator'] },
  { label: 'Schedule Appointment', to: '/appointments', icon: Calendar, color: 'from-teal-500 to-emerald-600', roles: ['Administrator', 'Doctor'] },
  { label: 'Medical Record', to: '/medical-records', icon: Activity, color: 'from-violet-500 to-purple-600', roles: ['Administrator', 'Doctor'] },
  { label: 'Write Prescription', to: '/prescriptions', icon: Pill, color: 'from-rose-500 to-pink-600', roles: ['Administrator', 'Doctor'] },
  { label: 'Order Lab Test', to: '/laboratory', icon: FlaskConical, color: 'from-amber-500 to-orange-600', roles: ['Administrator', 'Doctor'] },
  { label: 'Telemedicine', to: '/telemedicine', icon: Video, color: 'from-cyan-500 to-teal-600', roles: ['Administrator', 'Doctor', 'Patient'] },
]

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats()
  const isPatient = authStore.role === 'Patient'
  const isAdmin = authStore.role === 'Administrator'
  const isDoctor = authStore.role === 'Doctor'
  const firstName = authStore.fullName?.split(' ')[0] ?? 'there'
  const roleQuickActions = QUICK_ACTIONS.filter((a) => authStore.role && a.roles.includes(authStore.role))

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
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
            icon={<Pill className="h-5 w-5" />}
          />
          <StatCard
            label="Virtual Visits"
            value={isLoading ? '…' : (stats?.upcomingVirtualAppointments ?? 0)}
            tone="info"
            icon={<Video className="h-5 w-5" />}
          />
        </div>

        <Card className="overflow-hidden !p-0">
          <div className="bg-gradient-brand px-6 py-5 text-white">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold">Health Summary</h3>
                <p className="mt-1 text-sm font-medium text-white/80">
                  Your personalized care overview
                </p>
              </div>
              <Link to="/telemedicine" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full border-white/30 bg-white/10 text-white hover:border-white hover:bg-white/20 hover:text-white sm:w-auto">
                  <Video className="mr-2 h-4 w-4" />
                  Join Telemedicine
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid gap-6 p-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-bold text-slate-700">Quick actions</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  { label: 'Appointments', to: '/appointments', icon: Calendar },
                  { label: 'Prescriptions', to: '/prescriptions', icon: Pill },
                  { label: 'Lab Results', to: '/laboratory', icon: FlaskConical },
                  { label: 'Billing', to: '/billing', icon: CreditCard },
                ].map((a) => (
                  <Link key={a.to} to={a.to} className="aicare-quick-action">
                    <a.icon className="h-5 w-5 text-aicare-teal" />
                    <span className="text-sm">{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-teal-200/60 bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <p className="font-bold text-slate-800">AIcare Assistant</p>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-600">
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

  const virtualCount = stats?.upcomingVirtualAppointments ?? 0
  const inPersonCount = Math.max(0, (stats?.upcomingAppointments ?? 0) - virtualCount)

  const appointmentTrends = [
    { day: 'Mon', inPerson: Math.max(0, Math.round(inPersonCount * 0.9)), virtual: Math.max(0, Math.round(virtualCount * 0.8)) },
    { day: 'Tue', inPerson: Math.max(0, Math.round(inPersonCount * 0.85)), virtual: Math.max(0, Math.round(virtualCount * 0.9)) },
    { day: 'Wed', inPerson: inPersonCount, virtual: virtualCount },
    { day: 'Thu', inPerson: Math.max(0, Math.round(inPersonCount * 1.1)), virtual: Math.max(0, Math.round(virtualCount * 0.7)) },
    { day: 'Fri', inPerson: Math.max(0, Math.round(inPersonCount * 1.2)), virtual: Math.max(0, Math.round(virtualCount * 0.6)) },
    { day: 'Sat', inPerson: Math.max(0, Math.round(inPersonCount * 0.4)), virtual: Math.max(0, Math.round(virtualCount * 0.3)) },
    { day: 'Sun', inPerson: Math.max(0, Math.round(inPersonCount * 0.2)), virtual: Math.max(0, Math.round(virtualCount * 0.2)) },
  ]

  const dashStats = [
    { label: 'Total Patients', value: stats?.patients ?? 0, icon: Users, tone: 'info' as const },
    { label: 'Total Doctors', value: stats?.doctors ?? 0, icon: Stethoscope, tone: 'violet' as const },
    { label: 'Appointments Today', value: stats?.appointmentsToday ?? 0, icon: Calendar, tone: 'success' as const },
    { label: 'Active Consultations', value: stats?.activeConsultations ?? stats?.consultations ?? 0, icon: Activity, tone: 'warning' as const },
  ]

  return (
    <PageShell
      title="Executive Dashboard"
      description={`Welcome back, ${firstName}. Here's what's happening today.`}
      action={
        <div className="aicare-page-actions">
          <Link to="/reports" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              <Download className="h-4 w-4" />
              Report
            </Button>
          </Link>
          <Link to="/appointments" className="w-full sm:w-auto">
            <Button variant="accent" className="w-full sm:w-auto">
              <Zap className="h-4 w-4" />
              New Appointment
            </Button>
          </Link>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashStats.map((stat) => {
          const Icon = stat.icon
          return (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={isLoading ? '…' : stat.value}
              icon={<Icon className="h-5 w-5" />}
              tone={stat.tone}
            />
          )
        })}
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
            tone="violet"
            icon={<Brain className="h-5 w-5" />}
          />
        </div>
      )}

      {isDoctor && (
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Active Telemedicine"
            value={isLoading ? '…' : (stats?.activeTelemedicineSessions ?? 0)}
            tone="info"
            icon={<Video className="h-5 w-5" />}
          />
          <StatCard
            label="Upcoming Virtual"
            value={isLoading ? '…' : (stats?.upcomingVirtualAppointments ?? 0)}
            tone="success"
            icon={<Calendar className="h-5 w-5" />}
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-1 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-teal-500" />
            <h3 className="font-extrabold text-slate-900">Patient Growth</h3>
          </div>
          <p className="mb-4 text-xs font-semibold text-slate-400">Registrations · Jan–Jun 2026</p>
          <div className="h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData} margin={{ bottom: 4, left: -16, right: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Line type="monotone" dataKey="patients" stroke="#0D9488" strokeWidth={3} dot={{ r: 4, fill: '#0D9488' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="mb-1 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-sky-500" />
            <h3 className="font-extrabold text-slate-900">Appointment Trends</h3>
          </div>
          <p className="mb-4 text-xs font-semibold text-slate-400">In-person vs virtual · This week</p>
          <div className="h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentTrends} margin={{ bottom: 4, left: -16, right: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="inPerson" stackId="a" fill="#0D9488" radius={[0, 0, 0, 0]} />
                <Bar dataKey="virtual" stackId="a" fill="#0284C7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900">Recent Patients</h3>
            <Link to="/patients" className="text-sm font-bold text-aicare-teal hover:underline">View All →</Link>
          </div>
          <div className="space-y-2">
            {(recentPatients.data ?? []).map((p: { id: string; fullName?: string; gender?: string }) => (
              <div key={p.id} className="aicare-list-row bg-gradient-to-r from-slate-50 to-teal-50/30 transition-all hover:shadow-sm">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <AvatarInitials name={p.fullName ?? 'P'} />
                  <div className="min-w-0">
                    <p className="aicare-truncate-title">{p.fullName ?? 'Patient'}</p>
                    <p className="truncate text-xs font-medium text-slate-500">{p.gender ?? '—'}</p>
                  </div>
                </div>
                <StatusPill variant="success">Active</StatusPill>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900">Recent Appointments</h3>
            <Link to="/appointments" className="text-sm font-bold text-aicare-teal hover:underline">View All →</Link>
          </div>
          <div className="space-y-2">
            {(recentAppointments.data ?? []).map((a: { id: string; patientName?: string; status?: string; scheduledAt?: string }) => (
              <div key={a.id} className="aicare-list-row bg-gradient-to-r from-slate-50 to-sky-50/30 transition-all hover:shadow-sm">
                <div className="aicare-list-row-content">
                  <p className="aicare-truncate-title">{a.patientName ?? 'Patient'}</p>
                  <p className="truncate text-xs font-medium text-slate-500">{a.scheduledAt ? String(a.scheduledAt).slice(0, 16) : '—'}</p>
                </div>
                <StatusPill variant={String(a.status).toLowerCase().includes('complete') ? 'success' : 'info'}>
                  {a.status ?? 'Scheduled'}
                </StatusPill>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 flex items-center gap-2 font-extrabold text-slate-900">
          <Zap className="h-5 w-5 text-amber-500" />
          Quick Actions
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {roleQuickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.to} to={action.to} className="aicare-quick-action">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} text-white shadow-sm`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span>{action.label}</span>
              </Link>
            )
          })}
        </div>
      </Card>
    </PageShell>
  )
}
