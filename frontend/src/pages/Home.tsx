import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, X, History, TrendingUp, ArrowDownAZ, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCourses } from '@/hooks/use-courses'
import { useAnnouncements } from '@/hooks/use-announcements'
import { CourseCard } from '@/components/CourseCard'
import { CourseCardGridSkeleton } from '@/components/Skeletons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  useSearchStore,
  selectMostVisited,
  selectAlphabetical,
  filterCourses,
} from '@/store/search-store'
import type { Course } from '@/types'

export function Home() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const { data: coursesPage, isLoading, isError: coursesError } = useCourses(undefined, 1, 100)
  const { data: latestAnnouncements, isError: annError } = useAnnouncements(3)

  const recentSearches = useSearchStore((s) => s.recentSearches)
  const visits = useSearchStore((s) => s.visits)
  const addRecentSearch = useSearchStore((s) => s.addRecentSearch)
  const removeRecentSearch = useSearchStore((s) => s.removeRecentSearch)
  const clearRecentSearches = useSearchStore((s) => s.clearRecentSearches)

  const hasVisits = useMemo(
    () => Object.values(visits).some((v) => v > 0),
    [visits],
  )

  const courses = useMemo(() => coursesPage?.data ?? [], [coursesPage])

  const matchingCourses = useMemo(
    () => filterCourses(courses, query),
    [courses, query],
  )

  const suggestions = useMemo<Course[] | null>(() => {
    if (query.trim()) return null
    if (hasVisits) return selectMostVisited(courses, visits, 6)
    return selectAlphabetical(courses, 6)
  }, [courses, hasVisits, visits, query])

  const showDropdown = focused

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (query.trim()) addRecentSearch(query)
    setFocused(false)
    navigate('/courses')
  }

  const handleRecentClick = (term: string) => {
    setQuery(term)
    addRecentSearch(term)
    setFocused(false)
    navigate('/courses')
  }

  const handleCourseClick = (slug: string) => {
    setFocused(false)
    navigate(`/courses/${slug}`)
  }

  const popular = courses.slice(0, 6)

  return (
    <div>
      <section className="bg-gradient-to-br from-primary to-primary/70 px-4 py-20 text-primary-foreground">
        <div className="mx-auto max-w-3xl text-center">
          <img src="/logo.png" alt={t('home.title')} className="mx-auto mb-6 h-24 w-auto" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {t('home.title')}
          </h1>
          <p className="mt-4 text-lg text-primary-foreground/90">
            {t('home.subtitle')}
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg" variant="secondary">
              <a href="/courses">{t('home.browseCourses')}</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <form onSubmit={handleSearch} className="mx-auto max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder={t('home.searchPlaceholder')}
              className="pl-9"
              autoComplete="off"
            />

            {showDropdown && (
              <SearchDropdown
                query={query}
                recentSearches={recentSearches}
                matchingCourses={matchingCourses}
                suggestions={suggestions}
                suggestionMode={hasVisits ? 'visited' : 'alpha'}
                onRecentClick={handleRecentClick}
                onRemoveRecent={removeRecentSearch}
                onClearRecent={clearRecentSearches}
                onCourseClick={handleCourseClick}
              />
            )}
          </div>
        </form>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{t('home.popularCourses')}</h2>
        </div>
        {coursesError ? (
          <p className="text-muted-foreground">{t('common.error')}</p>
        ) : isLoading ? (
          <CourseCardGridSkeleton count={6} />
        ) : popular.length === 0 ? (
          <p className="text-muted-foreground">{t('home.noCourses')}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{t('home.announcements')}</h2>
          <Button asChild variant="outline" size="sm">
            <Link to="/announcements">{t('announcements.readMore')}</Link>
          </Button>
        </div>
        {annError ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('common.error')}</CardTitle>
            </CardHeader>
          </Card>
        ) : !latestAnnouncements || latestAnnouncements.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('home.noAnnouncements')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('home.noAnnouncementsDesc')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestAnnouncements.map((a) => (
              <Card key={a.id} className="flex flex-col">
                <CardContent className="flex flex-1 flex-col pt-6">
                  <div className="mb-1 text-xs text-muted-foreground">
                    {new Date(a.publishedAt).toLocaleDateString()}
                  </div>
                  <h3 className="mb-1 font-semibold leading-tight">{a.title}</h3>
                  {a.content && (
                    <p className="mb-2 text-sm text-muted-foreground line-clamp-2 flex-1">
                      {a.content}
                    </p>
                  )}
                  {a.sourceUrl && (
                    <a
                      href={a.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      {t('announcements.readMore')}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function SearchDropdown({
  query,
  recentSearches,
  matchingCourses,
  suggestions,
  suggestionMode,
  onRecentClick,
  onRemoveRecent,
  onClearRecent,
  onCourseClick,
}: {
  query: string
  recentSearches: string[]
  matchingCourses: Course[]
  suggestions: Course[] | null
  suggestionMode: 'visited' | 'alpha'
  onRecentClick: (term: string) => void
  onRemoveRecent: (term: string) => void
  onClearRecent: () => void
  onCourseClick: (slug: string) => void
}) {
  const { t } = useTranslation()

  if (query.trim()) {
    return (
      <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-md">
        {matchingCourses.length === 0 ? (
          <p className="px-3 py-3 text-sm text-muted-foreground">
            {t('home.noResults')}
          </p>
        ) : (
          <ul className="max-h-80 overflow-auto py-1">
            {matchingCourses.map((course) => (
              <li key={course.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onCourseClick(course.slug)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  <span className="font-medium">{course.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {course.category}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  return (
    <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-md">
      {recentSearches.length > 0 ? (
        <div>
          <div className="flex items-center justify-between px-3 py-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <History className="h-3.5 w-3.5" />
              {t('home.recentSearches')}
            </span>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onClearRecent}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {t('home.clear')}
            </button>
          </div>
          <ul className="max-h-80 overflow-auto pb-1">
            {recentSearches.map((term) => (
              <li key={term} className="group flex items-center">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onRecentClick(term)}
                  className="flex flex-1 items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="truncate">{term}</span>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onRemoveRecent(term)}
                  className="mr-2 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                  aria-label={t('home.remove')}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <div className="px-3 py-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              {suggestionMode === 'visited' ? (
                <>
                  <TrendingUp className="h-3.5 w-3.5" />
                  {t('home.mostVisited')}
                </>
              ) : (
                <>
                  <ArrowDownAZ className="h-3.5 w-3.5" />
                  {t('home.coursesLabel')}
                </>
              )}
            </span>
          </div>
          <ul className="max-h-80 overflow-auto pb-1">
            {(suggestions ?? []).map((course) => (
              <li key={course.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onCourseClick(course.slug)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  <span className="font-medium">{course.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {course.category}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
