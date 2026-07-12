import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  triggerScrape,
} from '@/api/announcements'
export function useAnnouncements(limit?: number) {
  return useQuery({
    queryKey: ['announcements', limit],
    queryFn: () => listAnnouncements(limit),
  })
}

export function useCreateAnnouncement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }),
  })
}

export function useUpdateAnnouncement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ title: string; content: string; source: string; sourceUrl: string; publishedAt: string }> }) =>
      updateAnnouncement(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }),
  })
}

export function useDeleteAnnouncement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }),
  })
}

export function useTriggerScrape() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: triggerScrape,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }),
  })
}
