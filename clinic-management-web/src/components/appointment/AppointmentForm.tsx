import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import { Button } from '../ui/button'
import { Input, Label } from '../ui/input'
import { api } from '../../services/api'
import { authStore } from '../../stores/authStore'

type Doctor = { id: string; fullName?: string; specialty?: string }
type Patient = { id: string; fullName?: string }

function getApiError(error: unknown, fallback: string): string {
  const e = error as AxiosError<{ detail?: string; title?: string; errors?: Record<string, string[]> }>
  const data = e?.response?.data
  if (!data) return fallback
  if (data.errors) {
    const msgs = Object.values(data.errors).flat().join(' · ')
    if (msgs) return msgs
  }
  return data.detail ?? data.title ?? fallback
}

/** Returns a datetime-local string pre-set to "now + 1 day" as a sensible default. */
function defaultScheduledAt() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setSeconds(0, 0)
  return d.toISOString().slice(0, 16)
}

export default function AppointmentForm({
  doctors,
  patients,
  onClose,
  onSuccess,
}: {
  doctors: Doctor[]
  patients?: Patient[]
  onClose: () => void
  onSuccess: () => void
}) {
  const role = authStore.role
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? '')
  const [patientId, setPatientId] = useState(patients?.[0]?.id ?? '')
  const [scheduledAt, setScheduledAt] = useState(defaultScheduledAt)
  const [notes, setNotes] = useState('')
  const [isVirtual, setIsVirtual] = useState(false)

  const showPatientPicker = role === 'Administrator' || role === 'Doctor'
  const showDoctorPicker = role === 'Patient' || role === 'Administrator'

  const mutation = useMutation({
    mutationFn: async () => {
      const scheduledDate = new Date(scheduledAt)
      if (isNaN(scheduledDate.getTime())) {
        throw new Error('Invalid date selected.')
      }
      if (scheduledDate <= new Date()) {
        throw new Error('Please choose a future date and time.')
      }
      return api.post('/Appointment', {
        doctorId: role === 'Doctor' ? undefined : doctorId || undefined,
        patientId: showPatientPicker ? (patientId || undefined) : undefined,
        scheduledAt: scheduledDate.toISOString(),
        notes: notes || undefined,
        isVirtual,
      })
    },
    onSuccess,
    onError: (error) => {
      const msg = error instanceof Error
        ? error.message
        : getApiError(error, 'Booking failed. Please try again.')
      toast.error(msg)
    },
  })

  const canSubmit =
    scheduledAt &&
    (!showDoctorPicker || doctorId) &&
    (!showPatientPicker || patientId) &&
    !mutation.isPending

  // Min date for the picker: now (browser-local)
  const minDateTime = new Date(Date.now() + 60_000).toISOString().slice(0, 16)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
      <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-slate-200 bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-aicare-lg sm:max-w-md sm:rounded-2xl">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />
        <h3 className="mb-4 text-lg font-bold text-slate-900">
          {isVirtual ? 'Book Virtual Visit' : 'Book Appointment'}
        </h3>
        <div className="space-y-4">
          {showPatientPicker && patients && (
            <div>
              <Label>Patient</Label>
              <select className="aicare-input mt-1" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
                <option value="">Select patient…</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName ?? p.id}
                  </option>
                ))}
              </select>
            </div>
          )}
          {showDoctorPicker && (
            <div>
              <Label>Doctor</Label>
              <select className="aicare-input mt-1" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
                <option value="">Select doctor…</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName ?? d.id}{d.specialty ? ` — ${d.specialty}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
          {role === 'Doctor' && (
            <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800">
              Booking on your schedule as {authStore.fullName ?? 'Doctor'}.
            </p>
          )}
          <div>
            <Label>Date &amp; Time</Label>
            <Input
              className="aicare-input mt-1"
              type="datetime-local"
              value={scheduledAt}
              min={minDateTime}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-400">Select a future date and time for the appointment.</p>
          </div>
          <div>
            <Label>Notes (optional)</Label>
            <Input className="aicare-input mt-1" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instructions…" />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={isVirtual} onChange={(e) => setIsVirtual(e.target.checked)} />
            Virtual (Telemedicine)
          </label>
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" className="w-full sm:w-auto" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="w-full sm:w-auto"
            variant="accent"
            onClick={() => mutation.mutate()}
            disabled={!canSubmit}
          >
            {mutation.isPending
              ? 'Booking…'
              : isVirtual
                ? 'Book Virtual Visit'
                : 'Book Appointment'}
          </Button>
        </div>
      </div>
    </div>
  )
}
