import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Course } from '@/types'
import { SEARCH_STORAGE_KEY } from '@/lib/constants'

const MAX_RECENT = 8

function getLocale(): string {
  if (typeof document !== 'undefined') {
    return document.documentElement.lang || 'bg'
  }
  return 'bg'
}

interface SearchState {
  recentSearches: string[]
  visits: Record<string, number>
  addRecentSearch: (query: string) => void
  removeRecentSearch: (query: string) => void
  clearRecentSearches: () => void
  incrementVisit: (slug: string) => void
  clearVisits: () => void
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      recentSearches: [],
      visits: {},
      addRecentSearch: (query) => {
        const trimmed = query.trim()
        if (!trimmed) return
        set((state) => ({
          recentSearches: [
            trimmed,
            ...state.recentSearches.filter((s) => s !== trimmed),
          ].slice(0, MAX_RECENT),
        }))
      },
      removeRecentSearch: (query) =>
        set((state) => ({
          recentSearches: state.recentSearches.filter((s) => s !== query),
        })),
      clearRecentSearches: () => set({ recentSearches: [] }),
      incrementVisit: (slug) =>
        set((state) => ({
          visits: { ...state.visits, [slug]: (state.visits[slug] ?? 0) + 1 },
        })),
      clearVisits: () => set({ visits: {} }),
    }),
    {
      name: SEARCH_STORAGE_KEY,
      partialize: (state) => ({
        recentSearches: state.recentSearches,
        visits: state.visits,
      }),
    },
  ),
)

export function selectMostVisited(
  courses: Course[],
  visits: Record<string, number>,
  limit = 6,
): Course[] {
  return [...courses]
    .map((course) => ({ course, count: visits[course.slug] ?? 0 }))
    .sort((a, b) => b.count - a.count || a.course.title.localeCompare(b.course.title, getLocale()))
    .slice(0, limit)
    .map((x) => x.course)
}

export function selectAlphabetical(courses: Course[], limit = 6): Course[] {
  return [...courses]
    .sort((a, b) => a.title.localeCompare(b.title, getLocale()))
    .slice(0, limit)
}

export function filterCourses(courses: Course[], query: string): Course[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return courses
    .filter(
      (course) =>
        course.title.toLowerCase().includes(q) ||
        (course.description ?? '').toLowerCase().includes(q) ||
        course.category.toLowerCase().includes(q),
    )
    .slice(0, 8)
}
