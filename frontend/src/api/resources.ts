import { apiClient } from './client'
import type { Resource, CreateResourceInput, UpdateResourceInput } from '@/types'

export async function fetchResources(courseSlug: string): Promise<Resource[]> {
  const res = await apiClient.get<Resource[]>(`/courses/${courseSlug}/resources`)
  return res.data
}

export async function createResource(
  courseSlug: string,
  data: CreateResourceInput,
): Promise<Resource> {
  const res = await apiClient.post<Resource>(`/courses/${courseSlug}/resources`, data)
  return res.data
}

export async function updateResource(id: number, data: UpdateResourceInput): Promise<Resource> {
  const res = await apiClient.patch<Resource>(`/resources/${id}`, data)
  return res.data
}

export async function deleteResource(id: number): Promise<void> {
  await apiClient.delete(`/resources/${id}`)
}
