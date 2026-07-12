export type Role = 'STUDENT' | 'MODERATOR' | 'ADMIN'

export type CourseCategory =
  | 'Programming'
  | 'Mathematics'
  | 'Data Analytics'
  | 'AI'
  | 'Databases'
  | 'Networks'
  | 'Cybersecurity'

export interface User {
  id: number
  name: string
  email: string
  role: Role
  avatar?: string | null
  createdAt: string
}

export interface Course {
  id: number
  title: string
  slug: string
  description?: string | null
  semester?: number | null
  credits?: number | null
  category: CourseCategory
}

export interface Professor {
  id: number
  name: string
  email?: string | null
  office?: string | null
  bio?: string | null
  photo?: string | null
}

export interface AuthResponse {
  user: User
  token: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface CreateCourseInput {
  title: string
  slug: string
  description?: string | null
  semester?: number | null
  credits?: number | null
  category: CourseCategory
}

export type UpdateCourseInput = {
  title?: string
  description?: string | null
  semester?: number | null
  credits?: number | null
  category?: CourseCategory
}

export interface CreateProfessorInput {
  name: string
  email?: string | null
  office?: string | null
  bio?: string | null
  photo?: string | null
}

export type UpdateProfessorInput = {
  name?: string
  email?: string | null
  office?: string | null
  bio?: string | null
  photo?: string | null
}

export interface UpdateRoleInput {
  role: Role
}

export const COURSE_CATEGORIES: CourseCategory[] = [
  'Programming',
  'Mathematics',
  'Data Analytics',
  'AI',
  'Databases',
  'Networks',
  'Cybersecurity',
]

export const ROLES: Role[] = ['STUDENT', 'MODERATOR', 'ADMIN']
