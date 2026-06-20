import { makeAutoObservable, runInAction } from 'mobx'
import { api } from '../services/api'

export type UserRole = 'Administrator' | 'Doctor' | 'Patient'

class AuthStore {
  token: string | null = localStorage.getItem('token')
  refreshToken: string | null = localStorage.getItem('refreshToken')
  role: UserRole | null = (localStorage.getItem('role') as UserRole | null) ?? null
  fullName: string | null = localStorage.getItem('fullName')
  userId: string | null = localStorage.getItem('userId')
  patientId: string | null = localStorage.getItem('patientId')
  doctorId: string | null = localStorage.getItem('doctorId')

  constructor() {
    makeAutoObservable(this)
  }

  get isAuthenticated() {
    return Boolean(this.token)
  }

  login(payload: { token: string; refreshToken: string; role: UserRole; fullName: string; userId?: string }) {
    this.token = payload.token
    this.refreshToken = payload.refreshToken
    this.role = payload.role
    this.fullName = payload.fullName
    if (payload.userId) this.userId = payload.userId
    localStorage.setItem('token', payload.token)
    localStorage.setItem('refreshToken', payload.refreshToken)
    localStorage.setItem('role', payload.role)
    localStorage.setItem('fullName', payload.fullName)
    if (payload.userId) localStorage.setItem('userId', payload.userId)
  }

  /** Fetches /auth/me and stores patientId / doctorId / userId. Should be called after login. */
  async fetchProfile() {
    try {
      const { data } = await api.get<{
        userId: string
        fullName: string
        email: string
        roleName: string
        patientId: string | null
        doctorId: string | null
      }>('/auth/me')
      runInAction(() => {
        this.userId = data.userId
        this.patientId = data.patientId
        this.doctorId = data.doctorId
      })
      localStorage.setItem('userId', data.userId)
      if (data.patientId) localStorage.setItem('patientId', data.patientId)
      else localStorage.removeItem('patientId')
      if (data.doctorId) localStorage.setItem('doctorId', data.doctorId)
      else localStorage.removeItem('doctorId')
    } catch {
      // Non-fatal: profile enrichment failed, basic auth still works
    }
  }

  logout() {
    this.token = null
    this.refreshToken = null
    this.role = null
    this.fullName = null
    this.userId = null
    this.patientId = null
    this.doctorId = null
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('role')
    localStorage.removeItem('fullName')
    localStorage.removeItem('userId')
    localStorage.removeItem('patientId')
    localStorage.removeItem('doctorId')
    if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
      window.location.href = '/login'
    }
  }
}

export const authStore = new AuthStore()
