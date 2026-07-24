import { Link, useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCourse } from '@/hooks/use-courses'
import { useWikiPages } from '@/hooks/use-wiki'
import { useAuth } from '@/hooks/use-auth'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LogoLoader } from '@/components/LogoLoader'

export function WikiList() {
  const { t } = useTranslation()
  const { slug = '' } = useParams()
  const { isAuthenticated } = useAuth()
  const { data: course, isLoading: courseLoading } = useCourse(slug)
  const { data: pages, isLoading, isError } = useWikiPages(slug, !!course)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        to={`/courses/${slug}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        {t('wiki.backToCourse')}
      </Link>

      <div className="mb-6 mt-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          {courseLoading ? (
            <LogoLoader size={32} />
          ) : (
            <h1 className="truncate text-3xl font-bold tracking-tight">
              {course?.title}
            </h1>
          )}
          <p className="mt-1 text-muted-foreground">{t('wiki.subtitle')}</p>
        </div>
        {isAuthenticated ? (
          <Button asChild className="shrink-0">
            <Link to={`/courses/${slug}/wiki/new`}>
              <Plus className="mr-1.5 h-4 w-4" />
              {t('wiki.newPage')}
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline" className="shrink-0">
            <Link to="/login">{t('wiki.loginToCreate')}</Link>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LogoLoader label />
        </div>
      ) : isError ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('common.error')}</CardTitle>
            <CardDescription className="flex flex-col items-start gap-2">
              <span>{t('wiki.errors.loadFailed')}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                {t('common.retry')}
              </Button>
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !pages || pages.length === 0 ? (
        <EmptyState
          title={t('wiki.empty')}
          description={t('wiki.emptyDesc')}
        />
      ) : (
        <div className="space-y-3">
          {pages.map((page) => (
            <Card key={page.id}>
              <CardHeader>
                <Link
                  to={`/courses/${slug}/wiki/${page.slug}`}
                  className="text-lg font-semibold hover:underline"
                >
                  {page.title}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {page.createdBy.name} &middot;{' '}
                  {t('wiki.updatedAt', {
                    date: new Date(page.updatedAt).toLocaleDateString(),
                  })}
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
