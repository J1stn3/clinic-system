import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Video } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, PageShell, StatusPill } from '../components/ui/PageShell'
import { api } from '../services/api'
import { authStore } from '../stores/authStore'

type TelemedicineSession = {
  id: string
  appointmentId: string
  meetingUrl: string
  status: string
  patientName?: string
  doctorName?: string
  scheduledAt?: string
}

export default function TelemedicineRoom() {
  const { appointmentId } = useParams<{ appointmentId: string }>()
  const role = authStore.role

  const sessionQuery = useQuery({
    queryKey: ['telemedicine', 'appointment', appointmentId],
    queryFn: async () => {
      const { data } = await api.get<TelemedicineSession>(`/Telemedicine/appointment/${appointmentId}`)
      return data
    },
    enabled: Boolean(appointmentId),
    retry: false,
  })

  useEffect(() => {
    const session = sessionQuery.data
    if (!session || session.status !== 'Created') return
    api.put(`/Telemedicine/${session.id}`, { status: 'In Progress' }).then(() => sessionQuery.refetch())
  }, [sessionQuery.data?.id, sessionQuery.data?.status])

  const session = sessionQuery.data
  const displayName = authStore.fullName ?? (role === 'Doctor' ? 'Doctor' : 'Patient')

  return (
    <PageShell
      title="Virtual Consultation"
      description="Secure video session for your telemedicine appointment."
      action={
        <Link to="/telemedicine" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      }
    >
      {sessionQuery.isLoading && (
        <Card className="py-12 text-center text-slate-500">Loading session…</Card>
      )}

      {sessionQuery.isError && (
        <Card className="py-12 text-center">
          <p className="font-medium text-slate-900">Session not found</p>
          <p className="mt-1 text-sm text-slate-500">This virtual appointment may not have a telemedicine session yet.</p>
          <Link to="/telemedicine" className="mt-4 inline-block">
            <Button variant="accent">View All Sessions</Button>
          </Link>
        </Card>
      )}

      {session && (
        <div className="space-y-3 sm:space-y-4">
          <Card className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm text-slate-500">Patient</p>
              <p className="truncate font-semibold text-slate-900">{session.patientName ?? 'Patient'}</p>
              <p className="mt-1 truncate text-xs text-slate-500">
                Dr. {session.doctorName ?? 'Doctor'}
                {session.scheduledAt
                  ? ` · ${new Date(session.scheduledAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`
                  : ''}
              </p>
            </div>
            <StatusPill variant={session.status === 'Completed' ? 'success' : 'info'}>{session.status}</StatusPill>
          </Card>

          <Card className="overflow-hidden !p-0">
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 sm:px-4 sm:py-3">
              <Video className="h-4 w-4 shrink-0 text-aicare-teal" />
              <span className="text-sm font-medium text-slate-700">Live video room</span>
            </div>
            <iframe
              title="Telemedicine video room"
              src={`${session.meetingUrl}#userInfo.displayName="${encodeURIComponent(displayName)}"`}
              allow="camera; microphone; fullscreen; display-capture"
              className="h-[min(52dvh,420px)] w-full bg-slate-900 sm:aspect-video sm:h-auto sm:min-h-[320px]"
            />
          </Card>

          {role === 'Doctor' && session.status !== 'Completed' && (
            <Link to="/consultations" className="block w-full sm:w-auto">
              <Button variant="accent" className="w-full sm:w-auto">
                Open Clinical Workflow
              </Button>
            </Link>
          )}
        </div>
      )}
    </PageShell>
  )
}
