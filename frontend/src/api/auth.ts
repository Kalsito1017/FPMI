import { apiClient } from './client'
import type { AuthResponse, LoginInput, RegisterInput, User } from '@/types'

export async function register(
  data: RegisterInput,
): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/auth/register', data)
  return res.data
}

export async function login(data: LoginInput): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/auth/login', data)
  return res.data
}

export async function me(): Promise<User> {
  const res = await apiClient.get<{ user: User }>('/auth/me')
  return res.data.user
}
