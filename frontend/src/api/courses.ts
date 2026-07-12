import { apiClient } from './client'
import type {
  Course,
  CourseCategory,
  CreateCourseInput,
  UpdateCourseInput,
} from '@/types'

export async function listCourses(
  category?: CourseCategory,
): Promise<Course[]> {
  const res = await apiClient.get<Course[]>('/courses', {
    params: category ? { category } : undefined,
  })
  return res.data
}

export async function getCourse(slug: string): Promise<Course> {
  const res = await apiClient.get<Course>(`/courses/${slug}`)
  return res.data
}

export async function createCourse(
  data: CreateCourseInput,
): Promise<Course> {
  const res = await apiClient.post<Course>('/courses', data)
  return res.data
}

export async function updateCourse(
  id: number,
  data: UpdateCourseInput,
): Promise<Course> {
  const res = await apiClient.patch<Course>(`/courses/${id}`, data)
  return res.data
}

export async function deleteCourse(id: number): Promise<void> {
  await apiClient.delete(`/courses/${id}`)
}

export async function exportCoursesCsv(): Promise<Blob> {
  const res = await apiClient.get('/courses/export/csv', {
    responseType: 'blob',
  })
  return res.data
}

export interface ImportResult {
  created: number
  skipped: number
  errors: { row: number; message: string }[]
}

export async function importCoursesCsv(file: File): Promise<ImportResult> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await apiClient.post<ImportResult>(
    '/courses/import/csv',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return res.data
}

export interface TUSofiaSpecialty {
  name: string
  form: string
  direction: string
  pdfUrl: string
}

export async function fetchTUSofiaSpecialties(): Promise<{
  bachelor: TUSofiaSpecialty[]
  master: TUSofiaSpecialty[]
}> {
  const res = await apiClient.get('/courses/tu-sofia/specialties')
  return res.data
}
