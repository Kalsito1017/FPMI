import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
import { Label } from '@/components/ui/label'

export function CreatePost() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createPost = useCreatePost()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    createPost.mutate(
      {
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim() || undefined,
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('community.titleLabel')}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">{t('community.contentLabel')}</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">{t('community.imageUrlLabel')}</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder={t('community.imageUrlPlaceholder')}
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
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
        </CardContent>
      </Card>
    </div>
  )
}
