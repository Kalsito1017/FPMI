import { apiClient } from './client'
import type {
  CreateProfessorInput,
  Professor,
  UpdateProfessorInput,
} from '@/types'

export async function listProfessors(): Promise<Professor[]> {
  const res = await apiClient.get<Professor[]>('/professors')
  return res.data
}

export async function getProfessor(id: number): Promise<Professor> {
  const res = await apiClient.get<Professor>(`/professors/${id}`)
  return res.data
}

export async function createProfessor(
  data: CreateProfessorInput,
): Promise<Professor> {
  const res = await apiClient.post<Professor>('/professors', data)
  return res.data
}

export async function updateProfessor(
  id: number,
  data: UpdateProfessorInput,
): Promise<Professor> {
  const res = await apiClient.patch<Professor>(`/professors/${id}`, data)
  return res.data
}

export async function deleteProfessor(id: number): Promise<void> {
  await apiClient.delete(`/professors/${id}`)
}
