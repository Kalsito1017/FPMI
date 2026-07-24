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
  specialty?: string | null
  hobbies?: string | null
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

export interface AuthResponse {
  user: User
  token: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  role?: string
  specialty?: string
  hobbies?: string
  turnstileToken: string
}

export interface ForgotPasswordInput {
  email: string
}

export interface ResetPasswordInput {
  token: string
  password: string
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
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

export type WikiPageStatus = 'DRAFT' | 'PUBLISHED'

export interface WikiPageListItem {
  id: number
  slug: string
  title: string
  createdAt: string
  updatedAt: string
  createdBy: { id: number; name: string; avatar?: string | null }
}

export interface WikiPage extends WikiPageListItem {
  courseId: number
  content: string
  status: WikiPageStatus
  course: { id: number; slug: string; title: string }
}

export interface CreateWikiPageInput {
  title: string
  content: string
  slug?: string
}

export interface UpdateWikiPageInput {
  title?: string
  content?: string
}

export type ResourceType = 'LINK' | 'VIDEO' | 'DOCUMENT' | 'BOOK' | 'OTHER'

export const RESOURCE_TYPES: ResourceType[] = [
  'LINK',
  'VIDEO',
  'DOCUMENT',
  'BOOK',
  'OTHER',
]

export interface Resource {
  id: number
  courseId: number
  title: string
  type: ResourceType
  url: string
  createdById: number
  createdBy: { id: number; name: string; avatar?: string | null }
  createdAt: string
}

export interface CreateResourceInput {
  title: string
  url: string
  type?: ResourceType
}

export interface UpdateResourceInput {
  title?: string
  type?: ResourceType
  url?: string
}

export interface Exam {
  id: number
  courseId: number
  title: string
  year: number
  semester?: number | null
  pdfUrl: string
  createdById: number
  createdBy: { id: number; name: string; avatar?: string | null }
  createdAt: string
}

export interface CreateExamInput {
  title: string
  year: number
  pdfUrl: string
  semester?: number | null
}

export interface UpdateExamInput {
  title?: string
  year?: number
  semester?: number | null
  pdfUrl?: string
}

export interface SearchResponse {
  query: string
  results: {
    courses: {
      id: number
      title: string
      slug: string
      category: string
      description?: string | null
    }[]
    wikiPages: {
      id: number
      title: string
      slug: string
      course: { slug: string; title: string }
    }[]
    resources: {
      id: number
      title: string
      type: ResourceType
      url: string
      course: { slug: string; title: string }
    }[]
    exams: {
      id: number
      title: string
      year: number
      pdfUrl: string
      course: { slug: string; title: string }
    }[]
  }
}
