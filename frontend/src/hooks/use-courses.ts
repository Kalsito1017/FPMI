import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCourse,
  deleteCourse,
  exportCoursesCsv,
  getCourse,
  importCoursesCsv,
  listCourses,
  updateCourse,
} from '@/api/courses'
import type {
  CourseCategory,
  CreateCourseInput,
  UpdateCourseInput,
} from '@/types'

export function useCourses(category?: CourseCategory, page?: number, limit?: number) {
  return useQuery({
    queryKey: ['courses', category, page, limit],
    queryFn: () => listCourses(category, page, limit),
  })
}

export function useCourse(slug: string) {
  return useQuery({
    queryKey: ['course', slug],
    queryFn: () => getCourse(slug),
    enabled: slug.length > 0,
    retry: false,
  })
}

export function useCreateCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCourseInput) => createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}

export function useUpdateCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCourseInput }) =>
      updateCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}

export function useDeleteCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}

export function useExportCourses() {
  return useMutation({
    mutationFn: exportCoursesCsv,
  })
}

export function useImportCourses() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => importCoursesCsv(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}
