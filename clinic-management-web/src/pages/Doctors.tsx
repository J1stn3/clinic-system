import { useQuery } from '@tanstack/react-query'
import { Calendar, Filter, Star, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { AvatarInitials, Card, EmptyState, PageShell, StatusPill } from '../components/ui/PageShell'
import { Button } from '../components/ui/button'
import { api } from '../services/api'
import { authStore } from '../stores/authStore'

type Doctor = {
  id: string
  fullName?: string
  specialty?: string
  licenseNumber?: string
}

export default function Doctors() {
  const [search, setSearch] = useState('')
  const [profile, setProfile] = useState<Doctor | null>(null)
  const doctors = useQuery({
    queryKey: ['doctors', 'grid'],
    queryFn: async () => (await api.get('/Doctor', { params: { page: 1, pageSize: 50 } })).data.items as Doctor[],
  })

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return doctors.data ?? []
    return (doctors.data ?? []).filter(
      (d) =>
        d.fullName?.toLowerCase().includes(term) ||
        d.specialty?.toLowerCase().includes(term),
    )
  }, [doctors.data, search])

  return (
    <PageShell
      title="Doctors Directory"
      description="Manage medical staff, schedules, and specializations."
      action={
        authStore.role === 'Administrator' ? (
          <Link to="/users" className="w-full sm:w-auto">
            <Button variant="accent" className="w-full sm:w-auto">+ Add Doctor</Button>
          </Link>
        ) : undefined
      }
    >
      <div className="aicare-toolbar">
        <input
          type="search"
          placeholder="Search doctors by name or specialty..."
          className="aicare-input w-full sm:max-w-md sm:flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 sm:w-11"
          aria-label="Filter doctors"
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {doctors.isLoading ? (
        <p className="text-sm text-slate-500">Loading doctors…</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="No doctors found" description="Try adjusting your search." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((doc) => (
            <Card key={doc.id} className="flex flex-col transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start gap-3">
                <AvatarInitials name={doc.fullName ?? 'Dr'} className="h-12 w-12 text-base" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{doc.fullName ?? 'Doctor'}</p>
                  <p className="text-sm font-medium text-aicare-teal">{doc.specialty ?? 'General Practice'}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-y border-slate-100 py-3 text-center">
                <div>
                  <p className="text-xs text-slate-500">License</p>
                  <p className="text-sm font-semibold text-slate-800">{doc.licenseNumber ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">ID</p>
                  <p className="text-sm font-semibold text-slate-800">{doc.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Rating</p>
                  <p className="flex items-center justify-center gap-0.5 text-sm font-semibold text-slate-800">
                    4.9 <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <StatusPill variant="success">Available</StatusPill>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="accent" className="flex-1" onClick={() => setProfile(doc)}>
                  View Profile
                </Button>
                <Link to="/appointments">
                  <Button variant="outline" size="default" className="px-3" aria-label="Schedule">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {profile && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
          <Card className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:max-w-md sm:rounded-2xl">
            <button
              type="button"
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              onClick={() => setProfile(null)}
              aria-label="Close profile"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-4">
              <AvatarInitials name={profile.fullName ?? 'Dr'} className="h-14 w-14 text-lg" />
              <div>
                <h3 className="text-lg font-bold text-slate-900">{profile.fullName ?? 'Doctor'}</h3>
                <p className="text-sm font-medium text-aicare-teal">{profile.specialty ?? 'General Practice'}</p>
              </div>
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex min-w-0 justify-between gap-2 rounded-xl bg-slate-50 px-3 py-3 sm:px-4">
                <span className="shrink-0 text-slate-500">License</span>
                <span className="truncate font-semibold text-slate-900">{profile.licenseNumber ?? '—'}</span>
              </div>
              <div className="flex min-w-0 justify-between gap-2 rounded-xl bg-slate-50 px-3 py-3 sm:px-4">
                <span className="shrink-0 text-slate-500">Staff ID</span>
                <span className="truncate font-semibold text-slate-900">{profile.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex min-w-0 justify-between gap-2 rounded-xl bg-slate-50 px-3 py-3 sm:px-4">
                <span className="text-slate-500">Status</span>
                <StatusPill variant="success">Available</StatusPill>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Link to="/appointments" className="flex-1" onClick={() => setProfile(null)}>
                <Button variant="accent" className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Appointment
                </Button>
              </Link>
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => { setProfile(null); toast.success('Profile saved to favorites') }}>
                Save
              </Button>
            </div>
          </Card>
        </div>
      )}
    </PageShell>
  )
}
