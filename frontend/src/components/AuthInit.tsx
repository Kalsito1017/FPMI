import { useEffect } from 'react'
import { me } from '@/api/auth'
import { useAuthStore } from '@/store/auth-store'

export function AuthInit({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    me()
      .then(setUser)
      .catch(() => setUser(null))
  }, [setUser])

  return <>{children}</>
}
