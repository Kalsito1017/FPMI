import axios from 'axios'
import { toast } from 'sonner'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error)
    }
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } else if (!error.response || error.code === 'ERR_NETWORK') {
      toast.error('Network error. Please check your connection.')
    } else if (error.response.status >= 500) {
      toast.error('Something went wrong. Please try again.')
    }
    return Promise.reject(error)
  },
)
