import { apiClient } from './client'

export interface AnalyticsOverview {
  users: number
  courses: number
  admins: number
}

export interface RoleDistribution {
  role: string
  count: number
}

export interface CategoryDistribution {
  category: string
  count: number
}

export interface SemesterDistribution {
  semester: number
  count: number
}

export interface UserGrowthPoint {
  month: string
  count: number
  cumulative: number
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const res = await apiClient.get<AnalyticsOverview>('/analytics/overview')
  return res.data
}

export async function getUsersByRole(): Promise<RoleDistribution[]> {
  const res = await apiClient.get<RoleDistribution[]>('/analytics/users-by-role')
  return res.data
}

export async function getCoursesByCategory(): Promise<CategoryDistribution[]> {
  const res = await apiClient.get<CategoryDistribution[]>(
    '/analytics/courses-by-category',
  )
  return res.data
}

export async function getCoursesBySemester(): Promise<SemesterDistribution[]> {
  const res = await apiClient.get<SemesterDistribution[]>(
    '/analytics/courses-by-semester',
  )
  return res.data
}

export async function getUserGrowth(): Promise<UserGrowthPoint[]> {
  const res = await apiClient.get<UserGrowthPoint[]>('/analytics/user-growth')
  return res.data
}
