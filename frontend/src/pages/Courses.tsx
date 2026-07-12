import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCourses } from '@/hooks/use-courses'
import { CourseCard } from '@/components/CourseCard'
import { COURSE_CATEGORIES, type CourseCategory } from '@/types'
import { cn } from '@/lib/utils'

export function Courses() {
  const { t } = useTranslation()
  const { data: courses, isLoading } = useCourses()
  const [active, setActive] = useState<CourseCategory | 'All'>('All')

  const grouped = useMemo(() => {
    const map = new Map<CourseCategory, typeof courses>()
    for (const category of COURSE_CATEGORIES) {
      map.set(category, [])
    }
    for (const course of courses ?? []) {
      map.get(course.category)?.push(course)
    }
    return map
  }, [courses])

  const visibleCategories =
    active === 'All'
      ? COURSE_CATEGORIES.filter((c) => (grouped.get(c) ?? []).length > 0)
      : [active]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">
        {t('courses.title')}
      </h1>

      <div className="mb-8 flex flex-wrap gap-2">
        <FilterButton
          label={t('courses.all')}
          active={active === 'All'}
          onClick={() => setActive('All')}
        />
        {COURSE_CATEGORIES.map((category) => (
          <FilterButton
            key={category}
            label={category}
            active={active === category}
            onClick={() => setActive(category)}
          />
        ))}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">{t('courses.loadingCourses')}</p>
      ) : visibleCategories.length === 0 ? (
        <p className="text-muted-foreground">
          {t('courses.noCoursesInCategory')}
        </p>
      ) : (
        <div className="space-y-10">
          {visibleCategories.map((category) => (
            <section key={category}>
              <h2 className="mb-4 text-xl font-semibold">{category}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(grouped.get(category) ?? []).map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-sm transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-input bg-background hover:bg-accent hover:text-accent-foreground',
      )}
    >
      {label}
    </button>
  )
}
