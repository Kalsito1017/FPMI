import { useAuthStore, useIsAuthenticated } from '@/store/auth-store'

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const setUser = useAuthStore((s) => s.setUser)
  const setToken = useAuthStore((s) => s.setToken)
  const logout = useAuthStore((s) => s.logout)
  const isAuthenticated = useIsAuthenticated()

  return {
    user,
    token,
    setUser,
    setToken,
    logout,
    isAuthenticated,
  }
}
