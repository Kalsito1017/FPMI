import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useCreatePost } from '@/hooks/use-community'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  content: z.string().min(1, 'Content is required').max(10000, 'Content is too long'),
  imageUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
})

type CreatePostForm = z.infer<typeof createPostSchema>

export function CreatePost() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createPost = useCreatePost()

  const form = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { title: '', content: '', imageUrl: '' },
  })

  const onSubmit = (values: CreatePostForm) => {
    createPost.mutate(
      {
        title: values.title.trim(),
        content: values.content.trim(),
        imageUrl: values.imageUrl?.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(t('community.postCreated'))
          navigate('/community')
        },
        onError: () => {
          toast.error(t('community.errors.createPost'))
        },
      },
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('community.createPost')}</CardTitle>
          <CardDescription>{t('community.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('community.titleLabel')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('community.contentLabel')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={10} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('community.imageUrlLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="url"
                        placeholder={t('community.imageUrlPlaceholder')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-2">
                <Button type="submit" disabled={createPost.isPending}>
                  {createPost.isPending
                    ? t('community.submitting')
                    : t('community.submit')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/community')}
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
