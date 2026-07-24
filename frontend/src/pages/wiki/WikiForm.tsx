import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useCourse } from '@/hooks/use-courses'
import {
  useCreateWikiPage,
  useUpdateWikiPage,
  useWikiPage,
} from '@/hooks/use-wiki'
import { useAuth } from '@/hooks/use-auth'
import { Markdown } from '@/components/Markdown'
import { slugify } from '@/utils/slugify'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { LogoLoader } from '@/components/LogoLoader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

type TFunc = (key: string, opts?: Record<string, unknown>) => string

function makeWikiFormSchema(t: TFunc) {
  return z.object({
    title: z
      .string()
      .min(1, t('wiki.errors.titleRequired'))
      .max(200, t('wiki.errors.titleTooLong')),
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/, t('wiki.errors.slugFormat'))
      .or(z.literal(''))
      .optional(),
    content: z
      .string()
      .min(1, t('wiki.errors.contentRequired'))
      .max(100000, t('wiki.errors.contentTooLong')),
  })
}

type WikiFormValues = z.infer<ReturnType<typeof makeWikiFormSchema>>

export function WikiForm() {
  const { t } = useTranslation()
  const { slug = '', pageSlug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEdit = pageSlug !== undefined

  const { data: course, isLoading: courseLoading } = useCourse(slug)
  const { data: page, isLoading: pageLoading } = useWikiPage(slug, pageSlug ?? '')
  const createPage = useCreateWikiPage(slug)
  const updatePage = useUpdateWikiPage(slug)

  const form = useForm<WikiFormValues>({
    resolver: zodResolver(makeWikiFormSchema(t)),
    defaultValues: { title: '', slug: '', content: '' },
  })

  const watchedTitle = form.watch('title')
  const watchedContent = form.watch('content')

  useEffect(() => {
    if (!isEdit && !form.getFieldState('slug').isDirty) {
      form.setValue('slug', slugify(watchedTitle))
    }
  }, [watchedTitle, isEdit, form])

  useEffect(() => {
    if (isEdit && page) {
      form.reset({ title: page.title, slug: page.slug, content: page.content })
    }
  }, [isEdit, page, form])

  if (courseLoading || (isEdit && pageLoading)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 py-16">
        <LogoLoader label />
      </div>
    )
  }

  if (!course) {
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

  if (isEdit) {
    const canModify =
      page &&
      user &&
      (user.id === page.createdBy.id ||
        user.role === 'ADMIN' ||
        user.role === 'MODERATOR')
    if (!page || !canModify) {
      return (
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="mb-2 text-2xl font-semibold">{t('wiki.notFound')}</h1>
          <p className="mb-6 text-muted-foreground">{t('wiki.notFoundDesc')}</p>
          <Button asChild>
            <Link to={`/courses/${slug}/wiki`}>{t('wiki.backToWiki')}</Link>
          </Button>
        </div>
      )
    }
  }

  const isPending = createPage.isPending || updatePage.isPending

  const onSubmit = (values: WikiFormValues) => {
    if (isEdit && page) {
      updatePage.mutate(
        {
          id: page.id,
          data: { title: values.title.trim(), content: values.content },
        },
        {
          onSuccess: () => {
            toast.success(t('wiki.updated'))
            navigate(`/courses/${slug}/wiki/${page.slug}`)
          },
          onError: () => toast.error(t('wiki.errors.updateFailed')),
        },
      )
    } else {
      createPage.mutate(
        {
          title: values.title.trim(),
          content: values.content,
          slug: values.slug?.trim() || undefined,
        },
        {
          onSuccess: (created) => {
            toast.success(t('wiki.created'))
            navigate(`/courses/${slug}/wiki/${created.slug}`)
          },
          onError: () => toast.error(t('wiki.errors.createFailed')),
        },
      )
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        to={isEdit ? `/courses/${slug}/wiki/${pageSlug}` : `/courses/${slug}/wiki`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        {isEdit ? t('wiki.backToPage') : t('wiki.backToWiki')}
      </Link>

      <Card className="mt-3">
        <CardHeader>
          <CardTitle>
            {isEdit ? t('wiki.editTitle') : t('wiki.newTitle')}
          </CardTitle>
          <CardDescription>
            {isEdit ? t('wiki.editDesc') : t('wiki.newDesc', { course: course.title })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('wiki.titleLabel')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isEdit && (
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('wiki.slugLabel')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={createPage.isPending}
                          placeholder={t('wiki.slugPlaceholder')}
                        />
                      </FormControl>
                      <FormDescription>{t('wiki.slugHint')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('wiki.contentLabel')}</FormLabel>
                    <Tabs defaultValue="write">
                      <TabsList>
                        <TabsTrigger value="write">{t('wiki.writeTab')}</TabsTrigger>
                        <TabsTrigger value="preview">
                          {t('wiki.previewTab')}
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="write">
                        <FormControl>
                          <Textarea {...field} rows={16} className="font-mono" />
                        </FormControl>
                      </TabsContent>
                      <TabsContent value="preview">
                        <div className="min-h-72 rounded-md border p-4">
                          {watchedContent.trim() ? (
                            <Markdown content={watchedContent} />
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              {t('wiki.previewEmpty')}
                            </p>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-2">
                <Button type="submit" disabled={isPending}>
                  {isPending
                    ? t('common.saving')
                    : isEdit
                      ? t('common.save')
                      : t('wiki.publish')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    navigate(
                      isEdit
                        ? `/courses/${slug}/wiki/${pageSlug}`
                        : `/courses/${slug}/wiki`,
                    )
                  }
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
