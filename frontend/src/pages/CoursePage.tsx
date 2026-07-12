import { type ReactNode, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BookOpen, FileText, Library, FileQuestion, MessagesSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCourse } from '@/hooks/use-courses'
import { CoursePageSkeleton } from '@/components/Skeletons'
import { useSearchStore } from '@/store/search-store'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function CoursePage() {
  const { t } = useTranslation()
  const { slug = '' } = useParams()
  const { data: course, isLoading, isError } = useCourse(slug)
  const incrementVisit = useSearchStore((s) => s.incrementVisit)

  useEffect(() => {
    if (course) incrementVisit(course.slug)
  }, [course, incrementVisit])

  if (isLoading) {
    return <CoursePageSkeleton />
  }

  if (isError || !course) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="mb-2 text-2xl font-semibold">{t('course.notFound')}</h1>
        <p className="mb-6 text-muted-foreground">{t('course.notFoundDesc')}</p>
        <Button asChild>
          <Link to="/courses">{t('course.backToCourses')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        to="/courses"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        {t('course.backToCoursesShort')}
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
        <span className="inline-flex rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
          {course.category}
        </span>
      </div>
      <p className="mt-3 text-muted-foreground">
        {course.description ?? t('course.noDescription')}
      </p>
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
        <span>
          {t('course.semester')}:{' '}
          {course.semester != null ? course.semester : '—'}
        </span>
        <span>
          {t('course.credits')}:{' '}
          {course.credits != null ? course.credits : '—'}
        </span>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <PlaceholderCard
          icon={<BookOpen className="h-5 w-5" />}
          title={t('course.wikiPages')}
        />
        <PlaceholderCard
          icon={<FileText className="h-5 w-5" />}
          title={t('course.assignments')}
        />
        <PlaceholderCard
          icon={<Library className="h-5 w-5" />}
          title={t('course.resources')}
        />
        <PlaceholderCard
          icon={<FileQuestion className="h-5 w-5" />}
          title={t('course.oldExams')}
        />
        <PlaceholderCard
          icon={<MessagesSquare className="h-5 w-5" />}
          title={t('course.forum')}
        />
      </div>
    </div>
  )
}

function PlaceholderCard({
  icon,
  title,
}: {
  icon: ReactNode
  title: string
}) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{t('course.comingSoon')}</p>
      </CardContent>
    </Card>
  )
}
