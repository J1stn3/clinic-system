import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from '../ui/button'
import { Input, Label } from '../ui/input'
import { api } from '../../services/api'
import { authStore } from '../../stores/authStore'

type Doctor = { id: string; fullName?: string; specialty?: string }
type Patient = { id: string; fullName?: string }

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
  const [scheduledAt, setScheduledAt] = useState('')
  const [notes, setNotes] = useState('')
  const [isVirtual, setIsVirtual] = useState(false)

  const showPatientPicker = role === 'Administrator' || role === 'Doctor'
  const showDoctorPicker = role === 'Patient' || role === 'Administrator'

  const mutation = useMutation({
    mutationFn: async () =>
      api.post('/Appointment', {
        doctorId: role === 'Doctor' ? undefined : doctorId,
        patientId: showPatientPicker ? patientId : undefined,
        scheduledAt: new Date(scheduledAt).toISOString(),
        notes,
        isVirtual,
      }),
    onSuccess,
  })

  const canSubmit =
    scheduledAt &&
    (!showDoctorPicker || doctorId) &&
    (!showPatientPicker || patientId) &&
    !mutation.isPending

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
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName ?? d.id} — {d.specialty}
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
            <Label>Date & Time</Label>
            <Input className="aicare-input mt-1" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
          </div>
          <div>
            <Label>Notes</Label>
            <Input className="aicare-input mt-1" value={notes} onChange={(e) => setNotes(e.target.value)} />
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
          <Button className="w-full sm:w-auto" variant="accent" onClick={() => mutation.mutate()} disabled={!canSubmit}>
            {isVirtual ? 'Book Virtual Visit' : 'Book Appointment'}
          </Button>
        </div>
      </div>
    </div>
  )
}
