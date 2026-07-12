import { apiClient } from './client'
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  User,
} from '@/types'

export async function register(
  data: RegisterInput,
): Promise<{ user: User }> {
  const res = await apiClient.post<{ user: User }>('/auth/register', data)
  return res.data
}

export async function login(data: LoginInput): Promise<{ user: User }> {
  const res = await apiClient.post<{ user: User }>('/auth/login', data)
  return res.data
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export async function me(): Promise<User> {
  const res = await apiClient.get<{ user: User }>('/auth/me')
  return res.data.user
}

export async function forgotPassword(data: ForgotPasswordInput): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>('/auth/forgot-password', data)
  return res.data
}

export async function resetPassword(data: ResetPasswordInput): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>('/auth/reset-password', data)
  return res.data
}

export async function changePassword(data: ChangePasswordInput): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>('/auth/change-password', data)
  return res.data
}

export async function updateProfile(data: {
  name?: string
  specialty?: string
  hobbies?: string
}): Promise<{ user: User }> {
  const res = await apiClient.patch<{ user: User }>('/auth/me', data)
  return res.data
}

export async function exportData(): Promise<unknown> {
  const res = await apiClient.get('/auth/export-data')
  return res.data
}

export async function deleteAccount(): Promise<void> {
  await apiClient.delete('/auth/account')
}
