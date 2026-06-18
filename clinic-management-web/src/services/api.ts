import axios from 'axios'
import { authStore } from '../stores/authStore'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
})

api.interceptors.request.use((config) => {
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry && authStore.refreshToken) {
      original._retry = true
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL ?? '/api'}/auth/refresh`,
          { refreshToken: authStore.refreshToken },
        )
        authStore.login({
          token: data.accessToken,
          refreshToken: data.refreshToken,
          role: data.roleName,
          fullName: data.fullName,
        })
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch {
        authStore.logout()
      }
    }
    return Promise.reject(error)
  },
)
