import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'

type Paged<T> = { items: T[] }

export function usePatients() {
  return useQuery({
    queryKey: ['options', 'patients'],
    queryFn: async () => (await api.get<Paged<{ id: string; fullName?: string }>>('/Patient', { params: { page: 1, pageSize: 100 } })).data.items,
  })
}

export function useDoctors() {
  return useQuery({
    queryKey: ['options', 'doctors'],
    queryFn: async () => (await api.get<Paged<{ id: string; fullName?: string; specialty?: string }>>('/Doctor', { params: { page: 1, pageSize: 100 } })).data.items,
  })
}

export function useBillings() {
  return useQuery({
    queryKey: ['options', 'billings'],
    queryFn: async () => (await api.get<Paged<{ id: string; patientId: string; amount: number; status: string }>>('/Billing', { params: { page: 1, pageSize: 100 } })).data.items,
  })
}

export function useAppointments() {
  return useQuery({
    queryKey: ['options', 'appointments'],
    queryFn: async () =>
      (
        await api.get<Paged<{ id: string; patientId: string; patientName?: string; doctorName?: string; status: string; isVirtual?: boolean; meetingUrl?: string; telemedicineStatus?: string; scheduledAt?: string }>>('/Appointment', {
          params: { page: 1, pageSize: 100 },
        })
      ).data.items,
  })
}
