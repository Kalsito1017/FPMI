import { apiClient } from './client'
import type {
  WikiPage,
  WikiPageListItem,
  CreateWikiPageInput,
  UpdateWikiPageInput,
} from '@/types'

export async function fetchWikiPages(courseSlug: string): Promise<WikiPageListItem[]> {
  const res = await apiClient.get<WikiPageListItem[]>(`/courses/${courseSlug}/wiki`)
  return res.data
}

export async function fetchWikiPage(courseSlug: string, pageSlug: string): Promise<WikiPage> {
  const res = await apiClient.get<WikiPage>(`/courses/${courseSlug}/wiki/${pageSlug}`)
  return res.data
}

export async function createWikiPage(
  courseSlug: string,
  data: CreateWikiPageInput,
): Promise<WikiPage> {
  const res = await apiClient.post<WikiPage>(`/courses/${courseSlug}/wiki`, data)
  return res.data
}

export async function updateWikiPage(id: number, data: UpdateWikiPageInput): Promise<WikiPage> {
  const res = await apiClient.patch<WikiPage>(`/wiki/${id}`, data)
  return res.data
}

export async function deleteWikiPage(id: number): Promise<void> {
  await apiClient.delete(`/wiki/${id}`)
}
