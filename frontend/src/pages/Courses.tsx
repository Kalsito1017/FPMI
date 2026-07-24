import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCourses } from '@/hooks/use-courses'
import { CourseCard } from '@/components/CourseCard'
import { LogoLoader } from '@/components/LogoLoader'
import { PaginationControls } from '@/components/PaginationControls'
import { Button } from '@/components/ui/button'
import { COURSE_CATEGORIES, type CourseCategory } from '@/types'
import { cn } from '@/lib/utils'

export function Courses() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1
  const [active, setActive] = useState<CourseCategory | 'All'>('All')

  const category = active === 'All' ? undefined : active
  const { data, isLoading, isError } = useCourses(category, page)

  const courses = data?.data ?? []

  const handleCategoryChange = (next: CourseCategory | 'All') => {
    setActive(next)
    setSearchParams(next === 'All' ? {} : { category: next })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">
        {t('courses.title')}
      </h1>

      <div className="mb-8 flex flex-wrap gap-2">
        <FilterButton
          label={t('courses.all')}
          active={active === 'All'}
          onClick={() => handleCategoryChange('All')}
        />
        {COURSE_CATEGORIES.map((category) => (
          <FilterButton
            key={category}
            label={category}
            active={active === category}
            onClick={() => handleCategoryChange(category)}
          />
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LogoLoader label />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-start gap-2">
          <p className="text-muted-foreground">{t('common.error')}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            {t('common.retry')}
          </Button>
        </div>
      ) : courses.length === 0 ? (
        <p className="text-muted-foreground">
          {t('courses.noCoursesInCategory')}
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {data?.meta && (
            <PaginationControls
              page={page}
              totalPages={data.meta.totalPages}
              onPageChange={(next) =>
                setSearchParams({
                  ...(category && { category }),
                  page: String(next),
                })
              }
            />
          )}
        </>
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