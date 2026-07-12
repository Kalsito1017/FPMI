import { apiClient } from './client'
import type {
  AuthResponse,
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  User,
} from '@/types'

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

export async function updateProfile(data: { name: string }): Promise<{ user: User }> {
  const res = await apiClient.patch<{ user: User }>('/auth/me', data)
  return res.data
}
