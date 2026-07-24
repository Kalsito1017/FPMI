import { apiClient } from './client'
import type { Exam, CreateExamInput, UpdateExamInput } from '@/types'

export async function fetchExams(courseSlug: string): Promise<Exam[]> {
  const res = await apiClient.get<Exam[]>(`/courses/${courseSlug}/exams`)
  return res.data
}

export async function createExam(courseSlug: string, data: CreateExamInput): Promise<Exam> {
  const res = await apiClient.post<Exam>(`/courses/${courseSlug}/exams`, data)
  return res.data
}

export async function updateExam(id: number, data: UpdateExamInput): Promise<Exam> {
  const res = await apiClient.patch<Exam>(`/exams/${id}`, data)
  return res.data
}

export async function deleteExam(id: number): Promise<void> {
  await apiClient.delete(`/exams/${id}`)
}
