import { type ReactNode, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BookOpen, Library, FileQuestion, MessagesSquare, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCourse } from '@/hooks/use-courses'
import { useWikiPages } from '@/hooks/use-wiki'
import { useResources } from '@/hooks/use-resources'
import { useExams } from '@/hooks/use-exams'
import { LogoLoader } from '@/components/LogoLoader'
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
  const { data: wikiPages } = useWikiPages(slug, !!course)
  const { data: resources } = useResources(slug, !!course)
  const { data: exams } = useExams(slug, !!course)
  const incrementVisit = useSearchStore((s) => s.incrementVisit)

  useEffect(() => {
    if (course) incrementVisit(course.slug)
  }, [course, incrementVisit])

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 py-16">
        <LogoLoader label />
      </div>
    )
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
        <LinkCard
          to={`/courses/${slug}/wiki`}
          icon={<BookOpen className="h-5 w-5" />}
          title={t('course.wikiPages')}
          count={wikiPages?.length}
        />
        <LinkCard
          to={`/courses/${slug}/resources`}
          icon={<Library className="h-5 w-5" />}
          title={t('course.resources')}
          count={resources?.length}
        />
        <LinkCard
          to={`/courses/${slug}/exams`}
          icon={<FileQuestion className="h-5 w-5" />}
          title={t('course.oldExams')}
          count={exams?.length}
        />
        <LinkCard
          to="/community"
          icon={<MessagesSquare className="h-5 w-5" />}
          title={t('course.forum')}
        />
      </div>

      {wikiPages && wikiPages.length > 0 && (
        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('course.wikiPages')}</h2>
            <Button asChild variant="outline" size="sm">
              <Link to={`/courses/${slug}/wiki`}>{t('course.viewAll')}</Link>
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {wikiPages.slice(0, 5).map((page) => (
                  <li key={page.id}>
                    <Link
                      to={`/courses/${slug}/wiki/${page.slug}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {resources && resources.length > 0 && (
        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('course.resources')}</h2>
            <Button asChild variant="outline" size="sm">
              <Link to={`/courses/${slug}/resources`}>{t('course.viewAll')}</Link>
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {resources.slice(0, 5).map((resource) => (
                  <li key={resource.id}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                    >
                      {resource.title}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  )
}

function LinkCard({
  to,
  icon,
  title,
  count,
}: {
  to: string
  icon: ReactNode
  title: string
  count?: number
}) {
  return (
    <Link to={to} className="block transition-transform hover:-translate-y-0.5">
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {count !== undefined && (
            <p className="text-sm text-muted-foreground">{count}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
