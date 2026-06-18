import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from '../ui/button'
import { Input, Label } from '../ui/input'
import { Card } from '../ui/PageShell'
import { api } from '../../services/api'

type Doctor = { id: string; fullName?: string; specialty?: string }

export default function AppointmentForm({
  doctors,
  onClose,
  onSuccess,
}: {
  doctors: Doctor[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? '')
  const [scheduledAt, setScheduledAt] = useState('')
  const [notes, setNotes] = useState('')
  const [isVirtual, setIsVirtual] = useState(false)

  const mutation = useMutation({
    mutationFn: async () =>
      api.post('/Appointment', {
        doctorId,
        scheduledAt: new Date(scheduledAt).toISOString(),
        notes,
        isVirtual,
      }),
    onSuccess,
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-md">
        <h3 className="mb-4 text-lg font-semibold">Book Appointment</h3>
        <div className="space-y-3">
          <div>
            <Label>Doctor</Label>
            <select
              className="w-full rounded-md border px-3 py-2"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName ?? d.id} — {d.specialty}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Date & Time</Label>
            <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
          </div>
          <div>
            <Label>Notes</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isVirtual} onChange={(e) => setIsVirtual(e.target.checked)} />
            Virtual (Telemedicine)
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={!scheduledAt || mutation.isPending}>
            Book
          </Button>
        </div>
      </Card>
    </div>
  )
}
