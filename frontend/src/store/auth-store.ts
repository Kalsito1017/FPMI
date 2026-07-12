import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { AUTH_STORAGE_KEY } from '@/lib/constants'

export { AUTH_STORAGE_KEY }

interface AuthState {
  user: User | null
  token: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => {
        set({ user: null, token: null })
        useAuthStore.persist.clearStorage()
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
)

export const useIsAuthenticated = () => useAuthStore((s) => !!s.token)
