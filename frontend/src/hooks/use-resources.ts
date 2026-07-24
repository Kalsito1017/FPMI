import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchResources,
  createResource,
  updateResource,
  deleteResource,
} from '@/api/resources'
import type { CreateResourceInput, UpdateResourceInput } from '@/types'

export function useResources(courseSlug: string, enabled = true) {
  return useQuery({
    queryKey: ['resources', courseSlug],
    queryFn: () => fetchResources(courseSlug),
    enabled: courseSlug.length > 0 && enabled,
  })
}

export function useCreateResource(courseSlug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateResourceInput) => createResource(courseSlug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources', courseSlug] })
    },
  })
}

export function useUpdateResource(courseSlug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateResourceInput }) =>
      updateResource(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources', courseSlug] })
    },
  })
}

export function useDeleteResource(courseSlug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteResource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources', courseSlug] })
    },
  })
}
