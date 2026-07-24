import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useDeleteWikiPage, useWikiPage } from '@/hooks/use-wiki'
import { useAuth } from '@/hooks/use-auth'
import { Markdown } from '@/components/Markdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LogoLoader } from '@/components/LogoLoader'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function WikiPage() {
  const { t } = useTranslation()
  const { slug = '', pageSlug = '' } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: page, isLoading, isError } = useWikiPage(slug, pageSlug)
  const deletePage = useDeleteWikiPage(slug)

  const handleDelete = () => {
    if (!page) return
    deletePage.mutate(page.id, {
      onSuccess: () => {
        toast.success(t('wiki.deleted'))
        navigate(`/courses/${slug}/wiki`)
      },
      onError: () => toast.error(t('wiki.errors.deleteFailed')),
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 py-16">
        <LogoLoader label />
      </div>
    )
  }

  if (isError || !page) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="mb-2 text-2xl font-semibold">{t('wiki.notFound')}</h1>
        <p className="mb-6 text-muted-foreground">{t('wiki.notFoundDesc')}</p>
        <Button asChild>
          <Link to={`/courses/${slug}/wiki`}>{t('wiki.backToWiki')}</Link>
        </Button>
      </div>
    )
  }

  const canModify =
    user &&
    (user.id === page.createdBy.id ||
      user.role === 'ADMIN' ||
      user.role === 'MODERATOR')

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to={`/courses/${slug}/wiki`}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            {t('wiki.title')}
          </Link>
        </Button>
        {canModify && (
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon">
              <Link to={`/courses/${slug}/wiki/${pageSlug}/edit`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('wiki.deleteTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('wiki.deleteConfirm', { title: page.title })}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">{t('common.cancel')}</Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deletePage.isPending}
                  >
                    {t('common.delete')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          <Link
            to={`/courses/${page.course.slug}`}
            className="hover:text-foreground hover:underline"
          >
            {page.course.title}
          </Link>
          {' · '}
          {page.createdBy.name}
          {' · '}
          {t('wiki.updatedAt', {
            date: new Date(page.updatedAt).toLocaleDateString(),
          })}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Markdown content={page.content} />
        </CardContent>
      </Card>
    </div>
  )
}
