import { useQuery } from '@tanstack/react-query'
import { Calendar, Filter, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CrudPage } from '../components/ui/CrudPage'
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

  const scrollToRecords = () => {
    document.getElementById('doctor-records')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <PageShell
        title="Doctors Directory"
        description="Manage medical staff, schedules, and specializations."
        action={
          authStore.role === 'Administrator' ? (
            <Button variant="accent" onClick={scrollToRecords}>
              + Add Doctor
            </Button>
          ) : undefined
        }
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Search doctors by name or specialty..."
            className="aicare-input max-w-md flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
            aria-label="Filter doctors"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>

        {doctors.isLoading ? (
          <p className="text-sm text-slate-500">Loading doctors…</p>
        ) : filtered.length === 0 ? (
          <EmptyState title="No doctors found" description="Try adjusting your search or add a new doctor below." />
        ) : (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((doc) => (
              <Card key={doc.id} className="flex flex-col">
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
                    <p className="text-sm font-semibold text-slate-800">{doc.licenseNumber?.slice(0, 6) ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">ID</p>
                    <p className="text-sm font-semibold text-slate-800">{doc.id.slice(0, 6).toUpperCase()}</p>
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
                  <Button variant="accent" className="flex-1" onClick={scrollToRecords}>
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
      </PageShell>

      <CrudPage
        title="Doctor Records"
        description="Full doctor records and administration"
        resource="Doctor"
        embedded
        anchorId="doctor-records"
        canCreate={authStore.role === 'Administrator'}
        createLabel="Add Doctor"
        columns={[
          { title: 'Name', dataIndex: 'fullName' },
          { title: 'Specialty', dataIndex: 'specialty' },
          { title: 'License', dataIndex: 'licenseNumber' },
        ]}
        fields={[
          { name: 'userId', label: 'User ID' },
          { name: 'specialty', label: 'Specialty' },
          { name: 'licenseNumber', label: 'License Number' },
        ]}
      />
    </>
  )
}
