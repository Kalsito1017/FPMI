import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchWikiPages,
  fetchWikiPage,
  createWikiPage,
  updateWikiPage,
  deleteWikiPage,
} from '@/api/wiki'
import type { CreateWikiPageInput, UpdateWikiPageInput } from '@/types'

export function useWikiPages(courseSlug: string, enabled = true) {
  return useQuery({
    queryKey: ['wiki-pages', courseSlug],
    queryFn: () => fetchWikiPages(courseSlug),
    enabled: courseSlug.length > 0 && enabled,
  })
}

export function useWikiPage(courseSlug: string, pageSlug: string) {
  return useQuery({
    queryKey: ['wiki-page', courseSlug, pageSlug],
    queryFn: () => fetchWikiPage(courseSlug, pageSlug),
    enabled: courseSlug.length > 0 && pageSlug.length > 0,
    retry: false,
  })
}

export function useCreateWikiPage(courseSlug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateWikiPageInput) => createWikiPage(courseSlug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiki-pages', courseSlug] })
    },
  })
}

export function useUpdateWikiPage(courseSlug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateWikiPageInput }) =>
      updateWikiPage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiki-pages', courseSlug] })
      queryClient.invalidateQueries({ queryKey: ['wiki-page', courseSlug] })
    },
  })
}

export function useDeleteWikiPage(courseSlug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteWikiPage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiki-pages', courseSlug] })
    },
  })
}
