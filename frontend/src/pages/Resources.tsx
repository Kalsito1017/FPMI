import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react'
import { useCourse } from '@/hooks/use-courses'
import {
  useCreateResource,
  useDeleteResource,
  useResources,
  useUpdateResource,
} from '@/hooks/use-resources'
import { useAuth } from '@/hooks/use-auth'
import { RESOURCE_TYPES, type Resource, type ResourceType } from '@/types'
import { EmptyState } from '@/components/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LogoLoader } from '@/components/LogoLoader'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type TFunc = (key: string, opts?: Record<string, unknown>) => string

function makeResourceFormSchema(t: TFunc) {
  return z.object({
    title: z
      .string()
      .min(1, t('resources.errors.titleRequired'))
      .max(200, t('resources.errors.titleTooLong')),
    url: z.string().url(t('resources.errors.urlInvalid')),
    type: z.enum(['LINK', 'VIDEO', 'DOCUMENT', 'BOOK', 'OTHER']),
  })
}

type ResourceFormValues = z.infer<ReturnType<typeof makeResourceFormSchema>>

const emptyValues: ResourceFormValues = { title: '', url: '', type: 'LINK' }

function toFormValues(resource: Resource): ResourceFormValues {
  return { title: resource.title, url: resource.url, type: resource.type }
}

export function Resources() {
  const { t } = useTranslation()
  const { slug = '' } = useParams()
  const { user, isAuthenticated } = useAuth()
  const { data: course, isLoading: courseLoading } = useCourse(slug)
  const { data: resources, isLoading, isError } = useResources(slug, !!course)
  const createResource = useCreateResource(slug)
  const updateResource = useUpdateResource(slug)
  const deleteResource = useDeleteResource(slug)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Resource | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (resource: Resource) => {
    setEditing(resource)
    setDialogOpen(true)
  }

  const canModify = (resource: Resource) =>
    user &&
    (user.id === resource.createdById ||
      user.role === 'ADMIN' ||
      user.role === 'MODERATOR')

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteResource.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(t('resources.deleted'))
        setDeleteTarget(null)
      },
      onError: () => toast.error(t('resources.errors.deleteFailed')),
    })
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        to={`/courses/${slug}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        {t('resources.backToCourse')}
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
          <p className="mt-1 text-muted-foreground">{t('resources.subtitle')}</p>
        </div>
        {isAuthenticated ? (
          <Button onClick={openCreate} className="shrink-0">
            <Plus className="mr-1.5 h-4 w-4" />
            {t('resources.addResource')}
          </Button>
        ) : (
          <Button asChild variant="outline" className="shrink-0">
            <Link to="/login">{t('resources.loginToAdd')}</Link>
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
              <span>{t('resources.errors.loadFailed')}</span>
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
      ) : !resources || resources.length === 0 ? (
        <EmptyState
          title={t('resources.empty')}
          description={t('resources.emptyDesc')}
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('resources.titleCol')}</TableHead>
                <TableHead>{t('resources.typeCol')}</TableHead>
                <TableHead>{t('resources.addedByCol')}</TableHead>
                <TableHead className="text-right">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell className="font-medium">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 hover:underline"
                    >
                      <span className="line-clamp-1">{resource.title}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {t(`resources.types.${resource.type}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {resource.createdBy.name} &middot;{' '}
                    {new Date(resource.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {canModify(resource) && (
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(resource)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(resource)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ResourceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        resource={editing}
        isCreating={createResource.isPending}
        isUpdating={updateResource.isPending}
        onSubmitCreate={(values) =>
          createResource.mutate(values, {
            onSuccess: () => {
              toast.success(t('resources.created'))
              setDialogOpen(false)
            },
            onError: () => toast.error(t('resources.errors.createFailed')),
          })
        }
        onSubmitUpdate={(id, values) =>
          updateResource.mutate(
            { id, data: values },
            {
              onSuccess: () => {
                toast.success(t('resources.updated'))
                setDialogOpen(false)
              },
              onError: () => toast.error(t('resources.errors.updateFailed')),
            },
          )
        }
      />

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('resources.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('resources.deleteConfirm', { title: deleteTarget?.title })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteResource.isPending}
            >
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ResourceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resource: Resource | null
  isCreating: boolean
  isUpdating: boolean
  onSubmitCreate: (data: { title: string; url: string; type?: ResourceType }) => void
  onSubmitUpdate: (
    id: number,
    data: { title?: string; url?: string; type?: ResourceType },
  ) => void
}

function ResourceFormDialog({
  open,
  onOpenChange,
  resource,
  isCreating,
  isUpdating,
  onSubmitCreate,
  onSubmitUpdate,
}: ResourceFormDialogProps) {
  const { t } = useTranslation()
  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(makeResourceFormSchema(t)),
    defaultValues: resource ? toFormValues(resource) : emptyValues,
  })

  useEffect(() => {
    if (open) {
      form.reset(resource ? toFormValues(resource) : emptyValues)
    }
  }, [open, resource, form])

  const handleSubmit = (values: ResourceFormValues) => {
    if (resource) {
      onSubmitUpdate(resource.id, {
        title: values.title.trim(),
        url: values.url.trim(),
        type: values.type,
      })
    } else {
      onSubmitCreate({
        title: values.title.trim(),
        url: values.url.trim(),
        type: values.type,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {resource ? t('resources.editTitle') : t('resources.newTitle')}
          </DialogTitle>
          <DialogDescription>
            {resource ? t('resources.editDesc') : t('resources.newDesc')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('resources.titleLabel')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('resources.urlLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="url"
                      placeholder={t('resources.urlPlaceholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('resources.typeLabel')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RESOURCE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(`resources.types.${type}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? t('common.saving') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
