import { useEffect, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ExternalLink, FileText, Search as SearchIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSearch } from '@/hooks/use-search'
import { EmptyState } from '@/components/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LogoLoader } from '@/components/LogoLoader'

export function Search() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const [value, setValue] = useState(q)
  const [prevQ, setPrevQ] = useState(q)

  if (prevQ !== q) {
    setPrevQ(q)
    setValue(q)
  }

  useEffect(() => {
    const trimmed = value.trim()
    if (trimmed === q) return
    const timeout = setTimeout(() => {
      setSearchParams(trimmed ? { q: trimmed } : {}, { replace: true })
    }, 300)
    return () => clearTimeout(timeout)
  }, [value, q, setSearchParams])

  const { data, isLoading, isError } = useSearch(q)
  const results = data?.results

  const total =
    (results?.courses.length ?? 0) +
    (results?.wikiPages.length ?? 0) +
    (results?.resources.length ?? 0) +
    (results?.exams.length ?? 0)

  const searching = q.trim().length >= 2

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">{t('search.title')}</h1>
      <p className="mt-1 text-muted-foreground">{t('search.subtitle')}</p>

      <div className="relative mt-6">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t('search.placeholder')}
          className="pl-9"
          autoComplete="off"
        />
      </div>

      <div className="mt-8">
        {!searching ? (
          <EmptyState
            title={t('search.startTitle')}
            description={t('search.startDesc')}
          />
        ) : isLoading ? (
          <div className="flex justify-center py-16">
            <LogoLoader label />
          </div>
        ) : isError ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('common.error')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                {t('common.retry')}
              </Button>
            </CardContent>
          </Card>
        ) : !results || total === 0 ? (
          <EmptyState
            title={t('search.noResults', { query: q })}
            description={t('search.noResultsDesc')}
          />
        ) : (
          <div className="space-y-8">
            {results.courses.length > 0 && (
              <ResultSection
                title={t('search.coursesSection')}
                count={results.courses.length}
              >
                {results.courses.map((course) => (
                  <li key={course.id}>
                    <Link
                      to={`/courses/${course.slug}`}
                      className="flex items-center justify-between gap-2 rounded-md border p-3 hover:bg-accent"
                    >
                      <span className="font-medium">{course.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {course.category}
                      </span>
                    </Link>
                  </li>
                ))}
              </ResultSection>
            )}
            {results.wikiPages.length > 0 && (
              <ResultSection
                title={t('search.wikiSection')}
                count={results.wikiPages.length}
              >
                {results.wikiPages.map((page) => (
                  <li key={page.id}>
                    <Link
                      to={`/courses/${page.course.slug}/wiki/${page.slug}`}
                      className="flex items-center justify-between gap-2 rounded-md border p-3 hover:bg-accent"
                    >
                      <span className="font-medium">{page.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {page.course.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ResultSection>
            )}
            {results.resources.length > 0 && (
              <ResultSection
                title={t('search.resourcesSection')}
                count={results.resources.length}
              >
                {results.resources.map((resource) => (
                  <li key={resource.id}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 rounded-md border p-3 hover:bg-accent"
                    >
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        {resource.title}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </span>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        {resource.course.title}
                        <Badge variant="secondary">
                          {t(`resources.types.${resource.type}`)}
                        </Badge>
                      </span>
                    </a>
                  </li>
                ))}
              </ResultSection>
            )}
            {results.exams.length > 0 && (
              <ResultSection
                title={t('search.examsSection')}
                count={results.exams.length}
              >
                {results.exams.map((exam) => (
                  <li key={exam.id}>
                    <a
                      href={exam.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 rounded-md border p-3 hover:bg-accent"
                    >
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <FileText className="h-3.5 w-3.5" />
                        {exam.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {exam.course.title} &middot; {exam.year}
                      </span>
                    </a>
                  </li>
                ))}
              </ResultSection>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ResultSection({
  title,
  count,
  children,
}: {
  title: string
  count: number
  children: ReactNode
}) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">
        {title} <span className="text-sm font-normal text-muted-foreground">({count})</span>
      </h2>
      <ul className="space-y-2">{children}</ul>
    </section>
  )
}
