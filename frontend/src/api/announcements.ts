import { apiClient } from './client'
import type { Announcement } from '@/types'

export function listAnnouncements(limit?: number) {
  const params = limit ? { limit: String(limit) } : undefined
  return apiClient.get<Announcement[]>('/announcements', { params }).then((r) => r.data)
}

export function getAnnouncement(id: number) {
  return apiClient.get<Announcement>(`/announcements/${id}`).then((r) => r.data)
}

export function createAnnouncement(data: {
  title: string
  content?: string
  source: string
  sourceUrl?: string
  publishedAt: string
}) {
  return apiClient.post<Announcement>('/announcements', data).then((r) => r.data)
}

export function updateAnnouncement(id: number, data: Partial<{
  title: string
  content: string
  source: string
  sourceUrl: string
  publishedAt: string
}>) {
  return apiClient.patch<Announcement>(`/announcements/${id}`, data).then((r) => r.data)
}

export function deleteAnnouncement(id: number) {
  return apiClient.delete(`/announcements/${id}`)
}

export function triggerScrape() {
  return apiClient.post<{ scraped: { source: string; added: number; skipped: number }[] }>('/announcements/scrape').then((r) => r.data)
}
