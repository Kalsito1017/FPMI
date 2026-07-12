import { Link, useSearchParams } from 'react-router-dom'
import { Heart, MessageCircle, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePosts } from '@/hooks/use-community'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function Communities() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1
  const { data, isLoading } = usePosts(page)

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
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="mt-2 h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
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

          {data?.meta && data.meta.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setSearchParams({ page: String(page - 1) })}
              >
                &laquo; Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {data.meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.meta.totalPages}
                onClick={() => setSearchParams({ page: String(page + 1) })}
              >
                Next &raquo;
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
