export type Role = 'GUEST' | 'STUDENT' | 'TEACHER' | 'MODERATOR' | 'ADMIN'
export type AnnouncementSource = 'facebook' | 'linkedin' | 'university' | 'manual'

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
  role?: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface Announcement {
  id: number
  title: string
  content?: string | null
  source: AnnouncementSource
  sourceUrl?: string | null
  publishedAt: string
  createdAt: string
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

export const ROLES: Role[] = ['GUEST', 'STUDENT', 'TEACHER', 'MODERATOR', 'ADMIN']

export interface CommunityPost {
  id: number
  title: string
  content: string
  imageUrl?: string | null
  authorId: number
  author: { id: number; name: string; avatar?: string | null }
  createdAt: string
  updatedAt: string
  _count: { comments: number; likes: number }
  likedByMe?: boolean
}

export interface CommunityComment {
  id: number
  content: string
  postId: number
  parentCommentId?: number | null
  authorId: number
  author: { id: number; name: string; avatar?: string | null }
  createdAt: string
  updatedAt: string
  replies?: CommunityComment[]
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CreatePostInput {
  title: string
  content: string
  imageUrl?: string
}

export interface UpdatePostInput {
  title?: string
  content?: string
  imageUrl?: string
}

export interface CreateCommentInput {
  content: string
  postId: number
  parentCommentId?: number
}
