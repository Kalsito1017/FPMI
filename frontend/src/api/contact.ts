import { apiClient } from './client'

export interface ContactMessage {
  id: number
  type: 'SUGGESTION' | 'FEATURE_REQUEST' | 'BUG_REPORT' | 'SPAM' | 'OTHER'
  subject: string
  message: string
  userId: number | null
  user?: { id: number; name: string; email: string } | null
  status: 'OPEN' | 'READ' | 'RESOLVED'
  createdAt: string
}

export function listContactMessages() {
  return apiClient.get<ContactMessage[]>('/contact').then((r) => r.data)
}

export function getContactMessage(id: number) {
  return apiClient.get<ContactMessage>(`/contact/${id}`).then((r) => r.data)
}

export function createContactMessage(data: {
  type: string
  subject: string
  message: string
}) {
  return apiClient.post<ContactMessage>('/contact', data).then((r) => r.data)
}

export function resolveContactMessage(id: number) {
  return apiClient.patch<ContactMessage>(`/contact/${id}/resolve`).then((r) => r.data)
}

export function deleteContactMessage(id: number) {
  return apiClient.delete(`/contact/${id}`)
}
