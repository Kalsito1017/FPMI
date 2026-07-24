import { Link, useSearchParams } from 'react-router-dom'
import { Heart, MessageCircle, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePosts } from '@/hooks/use-community'
import { useAuth } from '@/hooks/use-auth'
import { PaginationControls } from '@/components/PaginationControls'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LogoLoader } from '@/components/LogoLoader'

export function Communities() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1
  const { data, isLoading, isError } = usePosts(page)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('community.title')}</h1>
          <p className="mt-1 text-muted-foreground">{t('community.subtitle')}</p>
        </div>
        {isAuthenticated ? (
          <Button asChild>
            <Link to="/community/new">
              <Plus className="mr-1.5 h-4 w-4" />
              {t('community.newPost')}
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link to="/login">{t('community.loginToPost')}</Link>
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
            <CardTitle>{t('community.errors.loadFailed')}</CardTitle>
            <CardDescription className="flex flex-col items-start gap-2">
              <span>{t('common.error')}</span>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                {t('common.retry')}
              </Button>
            </CardDescription>
          </CardHeader>
        </Card>
      ) : data?.data.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('community.noPosts')}</CardTitle>
            <CardDescription>{t('community.noPostsDesc')}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {data?.data.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        to={`/community/${post.id}`}
                        className="text-lg font-semibold hover:underline"
                      >
                        {post.title}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {post.author.name} &middot;{' '}
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {post.content}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {post._count.likes}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {post._count.comments}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {data?.meta && (
            <PaginationControls
              page={page}
              totalPages={data.meta.totalPages}
              onPageChange={(next) => setSearchParams({ page: String(next) })}
            />
          )}
        </>
      )}
    </div>
  )
}
