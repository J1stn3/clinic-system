import { makeAutoObservable } from 'mobx'

export type UserRole = 'Administrator' | 'Doctor' | 'Patient'

class AuthStore {
  token: string | null = localStorage.getItem('token')
  refreshToken: string | null = localStorage.getItem('refreshToken')
  role: UserRole | null = (localStorage.getItem('role') as UserRole | null) ?? null
  fullName: string | null = localStorage.getItem('fullName')

  constructor() {
    makeAutoObservable(this)
  }

  get isAuthenticated() {
    return Boolean(this.token)
  }

  login(payload: { token: string; refreshToken: string; role: UserRole; fullName: string }) {
    this.token = payload.token
    this.refreshToken = payload.refreshToken
    this.role = payload.role
    this.fullName = payload.fullName
    localStorage.setItem('token', payload.token)
    localStorage.setItem('refreshToken', payload.refreshToken)
    localStorage.setItem('role', payload.role)
    localStorage.setItem('fullName', payload.fullName)
  }

  logout() {
    this.token = null
    this.refreshToken = null
    this.role = null
    this.fullName = null
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('role')
    localStorage.removeItem('fullName')
  }
}

export const authStore = new AuthStore()
