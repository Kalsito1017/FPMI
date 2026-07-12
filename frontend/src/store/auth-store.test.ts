import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useAuthStore, useIsAuthenticated, AUTH_STORAGE_KEY } from './auth-store'
import type { User } from '@/types'

const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'STUDENT',
  avatar: null,
  specialty: null,
  hobbies: null,
  createdAt: '2026-01-01T00:00:00.000Z',
}

describe('auth-store', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({ user: null })
  })

  it('setUser stores the user', () => {
    useAuthStore.getState().setUser(mockUser)
    expect(useAuthStore.getState().user).toEqual(mockUser)
  })

  it('isAuthenticated reflects user presence', () => {
    const { result } = renderHook(() => useIsAuthenticated())
    expect(result.current).toBe(false)

    act(() => {
      useAuthStore.getState().setUser(mockUser)
    })
    expect(result.current).toBe(true)

    act(() => {
      useAuthStore.getState().logout()
    })
    expect(result.current).toBe(false)
  })

  it('logout clears user and localStorage', () => {
    useAuthStore.getState().setUser(mockUser)
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).not.toBeNull()

    useAuthStore.getState().logout()

    expect(useAuthStore.getState().user).toBeNull()
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
  })
})
