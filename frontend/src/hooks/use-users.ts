import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listUsers, updateUserRole } from '@/api/users'
import type { Role } from '@/types'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => listUsers(),
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: Role }) =>
      updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
