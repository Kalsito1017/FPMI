import { useQuery } from '@tanstack/react-query'
import {
  getAnalyticsOverview,
  getCoursesByCategory,
  getCoursesBySemester,
  getUserGrowth,
  getUsersByRole,
} from '@/api/analytics'

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: getAnalyticsOverview,
  })
}

export function useUsersByRole() {
  return useQuery({
    queryKey: ['analytics', 'users-by-role'],
    queryFn: getUsersByRole,
  })
}

export function useCoursesByCategory() {
  return useQuery({
    queryKey: ['analytics', 'courses-by-category'],
    queryFn: getCoursesByCategory,
  })
}

export function useCoursesBySemester() {
  return useQuery({
    queryKey: ['analytics', 'courses-by-semester'],
    queryFn: getCoursesBySemester,
  })
}

export function useUserGrowth() {
  return useQuery({
    queryKey: ['analytics', 'user-growth'],
    queryFn: getUserGrowth,
  })
}
