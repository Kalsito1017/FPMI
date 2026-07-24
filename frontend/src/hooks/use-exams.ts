import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchExams,
  createExam,
  updateExam,
  deleteExam,
} from '@/api/exams'
import type { CreateExamInput, UpdateExamInput } from '@/types'

export function useExams(courseSlug: string, enabled = true) {
  return useQuery({
    queryKey: ['exams', courseSlug],
    queryFn: () => fetchExams(courseSlug),
    enabled: courseSlug.length > 0 && enabled,
  })
}

export function useCreateExam(courseSlug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateExamInput) => createExam(courseSlug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams', courseSlug] })
    },
  })
}

export function useUpdateExam(courseSlug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExamInput }) =>
      updateExam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams', courseSlug] })
    },
  })
}

export function useDeleteExam(courseSlug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteExam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams', courseSlug] })
    },
  })
}
