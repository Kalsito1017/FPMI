import { apiClient } from './client'
import type { Role, User } from '@/types'

export async function listUsers(): Promise<User[]> {
  const res = await apiClient.get<User[]>('/users')
  return res.data
}

export async function updateUserRole(
  id: number,
  role: Role,
): Promise<User> {
  const res = await apiClient.patch<User>(`/users/${id}/role`, { role })
  return res.data
}
