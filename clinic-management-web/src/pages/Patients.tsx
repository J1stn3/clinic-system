import { useQuery } from '@tanstack/react-query'
import { Filter, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AvatarInitials, Card, EmptyState, PageShell, StatCard, StatusPill } from '../components/ui/PageShell'
import { Button } from '../components/ui/button'
import { api } from '../services/api'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { authStore } from '../stores/authStore'

type Patient = {
  id: string
  fullName?: string
  gender?: string
  dateOfBirth?: string
}

export default function Patients() {
  const [search, setSearch] = useState('')
  const { data: stats, isLoading } = useDashboardStats()

  const patients = useQuery({
    queryKey: ['patients', 'grid'],
    queryFn: async () =>
      (await api.get('/Patient', { params: { page: 1, pageSize: 100 } })).data.items as Patient[],
  })

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return patients.data ?? []
    return (patients.data ?? []).filter(
      (p) =>
        p.fullName?.toLowerCase().includes(term) ||
        p.gender?.toLowerCase().includes(term),
    )
  }, [patients.data, search])

  function calcAge(dob?: string) {
    if (!dob) return null
    const birth = new Date(dob)
    const ageDiff = Date.now() - birth.getTime()
    return Math.floor(ageDiff / (365.25 * 24 * 60 * 60 * 1000))
  }

  return (
    <PageShell
      title="Patients"
      description="Manage patient records, medical history, and appointments."
      action={
        authStore.role === 'Administrator' ? (
          <Link to="/users" className="w-full sm:w-auto">
            <Button variant="accent" className="w-full sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          </Link>
        ) : undefined
      }
    >
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Registered Patients" value={isLoading ? '…' : (stats?.patients ?? 0)} tone="info" />
        <StatCard label="Appointments Today" value={isLoading ? '…' : (stats?.appointmentsToday ?? 0)} tone="success" />
        <StatCard label="Pending Bills" value={isLoading ? '…' : (stats?.pendingBills ?? 0)} tone="danger" />
        <StatCard label="New This Month" value={isLoading ? '…' : (stats?.newPatientsThisMonth ?? 0)} tone="default" />
      </div>

      {/* Search + filter toolbar */}
      <div className="aicare-toolbar">
        <input
          type="search"
          placeholder="Search patients by name or gender…"
          className="aicare-input w-full sm:max-w-md sm:flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 sm:w-11"
          aria-label="Filter patients"
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {/* Patient cards */}
      {patients.isLoading ? (
        <p className="text-sm text-slate-500">Loading patients…</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="No patients found" description="Try adjusting your search or add a new patient via User Management." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((patient) => {
            const age = calcAge(patient.dateOfBirth)
            return (
              <Card key={patient.id} className="flex flex-col transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start gap-3">
                  <AvatarInitials name={patient.fullName ?? 'P'} className="h-12 w-12 text-base" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{patient.fullName ?? 'Patient'}</p>
                    <p className="text-sm font-medium text-aicare-teal">
                      {patient.gender ?? 'Unknown'}{age !== null ? ` · ${age} yrs` : ''}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 border-y border-slate-100 py-3 text-center">
                  <div>
                    <p className="text-xs text-slate-500">Patient ID</p>
                    <p className="text-sm font-semibold text-slate-800">{patient.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Date of Birth</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {patient.dateOfBirth ? patient.dateOfBirth.slice(0, 10) : '—'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <StatusPill variant="success">Active</StatusPill>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link to="/appointments" className="flex-1">
                    <Button variant="accent" className="w-full">
                      Book Appointment
                    </Button>
                  </Link>
                  <Link to="/medical-records">
                    <Button variant="outline" size="default" className="px-3" aria-label="Medical records">
                      Records
                    </Button>
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Admin hint */}
      {authStore.role === 'Administrator' && (
        <p className="text-center text-xs text-slate-400">
          To register a new patient, go to{' '}
          <Link to="/users" className="font-semibold text-aicare-teal hover:underline">
            User Management
          </Link>{' '}
          and create a user with the <strong>Patient</strong> role.
        </p>
      )}
    </PageShell>
  )
}
