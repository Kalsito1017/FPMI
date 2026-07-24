import { apiClient } from './client'
import type { SearchResponse } from '@/types'

export async function search(query: string, limit?: number): Promise<SearchResponse> {
  const res = await apiClient.get<SearchResponse>('/search', {
    params: { q: query, ...(limit !== undefined && { limit }) },
  })
  return res.data
}
