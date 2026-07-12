import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listContactMessages,
  createContactMessage,
  resolveContactMessage,
  deleteContactMessage,
} from '@/api/contact'

export function useContactMessages() {
  return useQuery({
    queryKey: ['contact-messages'],
    queryFn: listContactMessages,
  })
}

export function useCreateContactMessage() {
  return useMutation({
    mutationFn: createContactMessage,
  })
}

export function useResolveContactMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: resolveContactMessage,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contact-messages'] }),
  })
}

export function useDeleteContactMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteContactMessage,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contact-messages'] }),
  })
}
