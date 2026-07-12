import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { AUTH_STORAGE_KEY } from '@/lib/constants'

export { AUTH_STORAGE_KEY }

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => {
        set({ user: null })
        useAuthStore.persist.clearStorage()
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({ user: state.user }),
    },
  ),
)

export const useIsAuthenticated = () => useAuthStore((s) => !!s.user)
