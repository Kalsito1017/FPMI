import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProfessor,
  deleteProfessor,
  getProfessor,
  listProfessors,
  updateProfessor,
} from '@/api/professors'
import type {
  CreateProfessorInput,
  UpdateProfessorInput,
} from '@/types'

export function useProfessors() {
  return useQuery({
    queryKey: ['professors'],
    queryFn: () => listProfessors(),
  })
}

export function useProfessor(id: number) {
  return useQuery({
    queryKey: ['professor', id],
    queryFn: () => getProfessor(id),
    enabled: id > 0,
    retry: false,
  })
}

export function useCreateProfessor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProfessorInput) => createProfessor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professors'] })
    },
  })
}

export function useUpdateProfessor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProfessorInput }) =>
      updateProfessor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professors'] })
    },
  })
}

export function useDeleteProfessor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteProfessor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professors'] })
    },
  })
}
