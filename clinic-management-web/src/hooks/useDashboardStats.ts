import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'

export type LabResultPreview = {
  name: string
  value: string
  referenceRange: string
  flag: string
}

export type DashboardStats = {
  patients: number
  doctors: number
  appointments: number
  appointmentsToday: number
  upcomingAppointments: number
  consultations: number
  activeConsultations: number
  prescriptions: number
  pendingLabTests: number
  activeLabTests: number
  completedLabToday: number
  awaitingLabVerification: number
  totalMedicines: number
  lowStockMedicines: number
  criticalStockMedicines: number
  expiringSoonMedicines: number
  dispensedToday: number
  pendingBills: number
  telemedicineSessions: number
  aiAnalyses: number
  totalRevenue: number
  newPatientsThisMonth: number
  nextAppointmentAt: string | null
  latestLabResults: LabResultPreview[]
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const { data } = await api.get<DashboardStats>('/dashboard/stats')
      return data
    },
    retry: false,
  })
}

export function formatNextAppointment(iso: string | null | undefined) {
  if (!iso) return 'None scheduled'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'None scheduled'
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
