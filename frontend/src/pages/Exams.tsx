import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FileText, Pencil, Plus, Trash2 } from 'lucide-react'
import { useCourse } from '@/hooks/use-courses'
import {
  useCreateExam,
  useDeleteExam,
  useExams,
  useUpdateExam,
} from '@/hooks/use-exams'
import { useAuth } from '@/hooks/use-auth'
import type { Exam } from '@/types'
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

function makeExamFormSchema(t: TFunc, maxYear: number) {
  return z.object({
    title: z
      .string()
      .min(1, t('exams.errors.titleRequired'))
      .max(200, t('exams.errors.titleTooLong')),
    year: z
      .string()
      .min(1, t('exams.errors.yearRequired'))
      .refine(
        (v) => /^\d+$/.test(v) && Number(v) >= 1990 && Number(v) <= maxYear,
        t('exams.errors.yearRange', { max: maxYear }),
      ),
    semester: z.enum(['none', '1', '2']),
    pdfUrl: z.string().url(t('exams.errors.pdfUrlInvalid')),
  })
}

type ExamFormValues = z.infer<ReturnType<typeof makeExamFormSchema>>

const emptyValues: ExamFormValues = {
  title: '',
  year: '',
  semester: 'none',
  pdfUrl: '',
}

function toFormValues(exam: Exam): ExamFormValues {
  return {
    title: exam.title,
    year: String(exam.year),
    semester: exam.semester != null ? (String(exam.semester) as '1' | '2') : 'none',
    pdfUrl: exam.pdfUrl,
  }
}

export function Exams() {
  const { t } = useTranslation()
  const { slug = '' } = useParams()
  const { user, isAuthenticated } = useAuth()
  const { data: course, isLoading: courseLoading } = useCourse(slug)
  const { data: exams, isLoading, isError } = useExams(slug, !!course)
  const createExam = useCreateExam(slug)
  const updateExam = useUpdateExam(slug)
  const deleteExam = useDeleteExam(slug)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Exam | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (exam: Exam) => {
    setEditing(exam)
    setDialogOpen(true)
  }

  const canModify = (exam: Exam) =>
    user &&
    (user.id === exam.createdById ||
      user.role === 'ADMIN' ||
      user.role === 'MODERATOR')

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteExam.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(t('exams.deleted'))
        setDeleteTarget(null)
      },
      onError: () => toast.error(t('exams.errors.deleteFailed')),
    })
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        to={`/courses/${slug}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        {t('exams.backToCourse')}
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
          <p className="mt-1 text-muted-foreground">{t('exams.subtitle')}</p>
        </div>
        {isAuthenticated ? (
          <Button onClick={openCreate} className="shrink-0">
            <Plus className="mr-1.5 h-4 w-4" />
            {t('exams.addExam')}
          </Button>
        ) : (
          <Button asChild variant="outline" className="shrink-0">
            <Link to="/login">{t('exams.loginToAdd')}</Link>
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
              <span>{t('exams.errors.loadFailed')}</span>
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
      ) : !exams || exams.length === 0 ? (
        <EmptyState title={t('exams.empty')} description={t('exams.emptyDesc')} />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('exams.titleCol')}</TableHead>
                <TableHead>{t('exams.yearCol')}</TableHead>
                <TableHead>{t('exams.semesterCol')}</TableHead>
                <TableHead>{t('exams.pdfCol')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">
                    <span className="line-clamp-1">{exam.title}</span>
                  </TableCell>
                  <TableCell>{exam.year}</TableCell>
                  <TableCell>
                    {exam.semester != null ? (
                      <Badge variant="secondary">{exam.semester}</Badge>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={exam.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="mr-1.5 h-4 w-4" />
                        PDF
                      </a>
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    {canModify(exam) && (
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(exam)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(exam)}
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

      <ExamFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        exam={editing}
        isCreating={createExam.isPending}
        isUpdating={updateExam.isPending}
        onSubmitCreate={(values) =>
          createExam.mutate(values, {
            onSuccess: () => {
              toast.success(t('exams.created'))
              setDialogOpen(false)
            },
            onError: () => toast.error(t('exams.errors.createFailed')),
          })
        }
        onSubmitUpdate={(id, values) =>
          updateExam.mutate(
            { id, data: values },
            {
              onSuccess: () => {
                toast.success(t('exams.updated'))
                setDialogOpen(false)
              },
              onError: () => toast.error(t('exams.errors.updateFailed')),
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
            <DialogTitle>{t('exams.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('exams.deleteConfirm', { title: deleteTarget?.title })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteExam.isPending}
            >
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ExamFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exam: Exam | null
  isCreating: boolean
  isUpdating: boolean
  onSubmitCreate: (data: {
    title: string
    year: number
    pdfUrl: string
    semester?: number | null
  }) => void
  onSubmitUpdate: (
    id: number,
    data: { title?: string; year?: number; pdfUrl?: string; semester?: number | null },
  ) => void
}

function ExamFormDialog({
  open,
  onOpenChange,
  exam,
  isCreating,
  isUpdating,
  onSubmitCreate,
  onSubmitUpdate,
}: ExamFormDialogProps) {
  const { t } = useTranslation()
  const maxYear = new Date().getFullYear() + 1
  const form = useForm<ExamFormValues>({
    resolver: zodResolver(makeExamFormSchema(t, maxYear)),
    defaultValues: exam ? toFormValues(exam) : emptyValues,
  })

  useEffect(() => {
    if (open) {
      form.reset(exam ? toFormValues(exam) : emptyValues)
    }
  }, [open, exam, form])

  const handleSubmit = (values: ExamFormValues) => {
    const payload = {
      title: values.title.trim(),
      year: Number(values.year),
      pdfUrl: values.pdfUrl.trim(),
      semester: values.semester === 'none' ? null : Number(values.semester),
    }
    if (exam) {
      onSubmitUpdate(exam.id, payload)
    } else {
      onSubmitCreate(payload)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{exam ? t('exams.editTitle') : t('exams.newTitle')}</DialogTitle>
          <DialogDescription>
            {exam ? t('exams.editDesc') : t('exams.newDesc')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('exams.titleLabel')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('exams.yearLabel')}</FormLabel>
                    <FormControl>
                      <Input type="number" min={1990} max={maxYear} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('exams.semesterLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">{t('exams.semesterNone')}</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="pdfUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('exams.pdfUrlLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="url"
                      placeholder={t('exams.pdfUrlPlaceholder')}
                    />
                  </FormControl>
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
