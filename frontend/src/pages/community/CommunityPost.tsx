import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Heart, MessageCircle, ArrowLeft, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  usePost,
  useToggleLike,
  useCreateComment,
  useDeleteComment,
  useDeletePost,
} from '@/hooks/use-community'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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

export function CommunityPost() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, isAuthenticated } = useAuth()

  const postId = Number(id)
  const { data: post, isLoading } = usePost(postId)
  const toggleLike = useToggleLike()
  const createComment = useCreateComment()
  const deleteComment = useDeleteComment()
  const deletePost = useDeletePost()

  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(null)
  const [replyText, setReplyText] = useState('')

  const canModify = user && (user.role === 'ADMIN' || user.role === 'MODERATOR')

  const handleLike = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    toggleLike.mutate(postId)
  }

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return
    createComment.mutate(
      { content: commentText.trim(), postId },
      {
        onSuccess: () => {
          setCommentText('')
          toast.success(t('community.commentCreated'))
        },
        onError: () => toast.error(t('community.errors.createComment')),
      },
    )
  }

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !replyTo) return
    createComment.mutate(
      { content: replyText.trim(), postId, parentCommentId: replyTo.id },
      {
        onSuccess: () => {
          setReplyText('')
          setReplyTo(null)
          toast.success(t('community.commentCreated'))
        },
        onError: () => toast.error(t('community.errors.createComment')),
      },
    )
  }

  const handleDeletePost = () => {
    deletePost.mutate(postId, {
      onSuccess: () => {
        toast.success(t('community.postDeleted'))
        navigate('/community')
      },
      onError: () => toast.error(t('community.errors.deletePost')),
    })
  }

  const handleDeleteComment = (commentId: number) => {
    deleteComment.mutate(commentId, {
      onSuccess: () => toast.success(t('community.commentDeleted')),
      onError: () => toast.error(t('community.errors.deleteComment')),
    })
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-4 h-48 w-full" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-muted-foreground">Post not found.</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/community">&larr; Back to community</Link>
        </Button>
      </div>
    )
  }

  const isAuthor = user?.id === post.authorId

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/community">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          {t('community.title')}
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold">{post.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {post.author.name} &middot;{' '}
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
            {(isAuthor || canModify) && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('community.deletePost')}</DialogTitle>
                    <DialogDescription>
                      {t('community.deleteConfirm')}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">{t('common.cancel')}</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button variant="destructive" onClick={handleDeletePost}>
                        {t('common.delete')}
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {post.content}
          </div>

          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt=""
              className="mt-4 max-h-96 w-full rounded-md object-cover"
            />
          )}

          <div className="mt-4 flex items-center gap-4 border-t pt-4 text-sm text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={post.likedByMe ? 'text-red-500' : ''}
            >
              <Heart
                className={`mr-1 h-4 w-4 ${post.likedByMe ? 'fill-current' : ''}`}
              />
              {post.likedByMe ? t('community.unlike') : t('community.like')}
              <span className="ml-1">({post._count.likes})</span>
            </Button>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {post._count.comments} {t('community.comments')}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <h2 className="mb-4 text-lg font-semibold">
          {post._count.comments > 0
            ? `${post._count.comments} ${t('community.comments')}`
            : t('community.comments')}
        </h2>

        {isAuthenticated ? (
          <form onSubmit={handleComment} className="mb-6 flex gap-2">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={t('community.writeComment')}
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={createComment.isPending}>
              {t('community.comment')}
            </Button>
          </form>
        ) : (
          <Button asChild variant="outline" size="sm" className="mb-6">
            <Link to="/login">{t('community.loginToComment')}</Link>
          </Button>
        )}

        <div className="space-y-4">
          {post.comments?.map((comment) => (
            <div key={comment.id}>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{comment.author.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {comment.content}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {isAuthenticated && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setReplyTo({ id: comment.id, name: comment.author.name })
                          }
                        >
                          {t('community.reply')}
                        </Button>
                      )}
                      {(user?.id === comment.authorId || canModify) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-6 mt-2 space-y-2 border-l-2 pl-4">
                  {comment.replies.map((reply) => (
                    <Card key={reply.id}>
                      <CardContent className="pt-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{reply.author.name}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {reply.content}
                            </p>
                          </div>
                          {(user?.id === reply.authorId || canModify) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteComment(reply.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {replyTo && replyTo.id === comment.id && (
                <form onSubmit={handleReply} className="ml-6 mt-2 flex gap-2">
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={t('community.writeReply')}
                    className="flex-1"
                    autoFocus
                  />
                  <Button type="submit" size="sm" disabled={createComment.isPending}>
                    {t('community.reply')}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyTo(null)}
                  >
                    {t('community.cancelReply')}
                  </Button>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
