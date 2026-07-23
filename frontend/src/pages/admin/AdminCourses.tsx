import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  useCreateCourse,
  useCourses,
  useDeleteCourse,
  useUpdateCourse,
} from '@/hooks/use-courses'
import { COURSE_CATEGORIES, type Course, type CourseCategory } from '@/types'
import { Button } from '@/components/ui/button'
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
  FormDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type TFunc = (key: string, opts?: Record<string, unknown>) => string

function makeCourseFormSchema(t: TFunc) {
  return z.object({
    title: z.string().min(1, t('admin.coursesPage.errors.titleRequired')),
    slug: z
      .string()
      .min(1, t('admin.coursesPage.errors.slugRequired'))
      .regex(/^[a-z0-9-]+$/, t('admin.coursesPage.errors.slugFormat')),
    description: z.string().optional(),
    semester: z
      .string()
      .optional()
      .refine(
        (v) =>
          v === '' ||
          v === undefined ||
          (/^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 8),
        t('admin.coursesPage.errors.semesterRange'),
      ),
    credits: z
      .string()
      .optional()
      .refine(
        (v) =>
          v === '' || v === undefined || (/^\d+$/.test(v) && Number(v) >= 0),
        t('admin.coursesPage.errors.creditsNonNeg'),
      ),
    category: z.enum([
      'Programming',
      'Mathematics',
      'Data Analytics',
      'AI',
      'Databases',
      'Networks',
      'Cybersecurity',
    ]),
  })
}

type CourseFormValues = z.infer<ReturnType<typeof makeCourseFormSchema>>

const emptyValues: CourseFormValues = {
  title: '',
  slug: '',
  description: '',
  semester: '',
  credits: '',
  category: 'Programming',
}

function toFormValues(course: Course): CourseFormValues {
  return {
    title: course.title,
    slug: course.slug,
    description: course.description ?? '',
    semester: course.semester != null ? String(course.semester) : '',
    credits: course.credits != null ? String(course.credits) : '',
    category: course.category,
  }
}

type CreateCoursePayload = {
  title: string
  slug: string
  description: string | null
  semester: number | null
  credits: number | null
  category: CourseCategory
}

type UpdateCoursePayload = Omit<CreateCoursePayload, 'slug'>

export function AdminCourses() {
  const { t } = useTranslation()
  const { data: coursesPage, isLoading } = useCourses(undefined, 1, 100)
  const courses = coursesPage?.data ?? []
  const createCourse = useCreateCourse()
  const updateCourse = useUpdateCourse()
  const deleteCourse = useDeleteCourse()

  const [editing, setEditing] = useState<Course | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (course: Course) => {
    setEditing(course)
    setDialogOpen(true)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteCourse.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(t('admin.coursesPage.deleted'))
        setDeleteTarget(null)
      },
      onError: () => toast.error(t('admin.coursesPage.deleteError')),
    })
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {t('admin.coursesPage.title')}
        </h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t('admin.coursesPage.newCourse')}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.coursesPage.titleCol')}</TableHead>
              <TableHead>{t('admin.coursesPage.slugCol')}</TableHead>
              <TableHead>{t('admin.coursesPage.categoryCol')}</TableHead>
              <TableHead>{t('admin.coursesPage.semesterCol')}</TableHead>
              <TableHead>{t('admin.coursesPage.creditsCol')}</TableHead>
              <TableHead className="text-right">
                {t('admin.coursesPage.actionsCol')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  {t('admin.coursesPage.loading')}
                </TableCell>
              </TableRow>
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  {t('admin.coursesPage.noCourses')}
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {course.slug}
                  </TableCell>
                  <TableCell>{course.category}</TableCell>
                  <TableCell>{course.semester ?? '—'}</TableCell>
                  <TableCell>{course.credits ?? '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(course)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(course)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CourseFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        course={editing}
        isCreating={createCourse.isPending}
        isUpdating={updateCourse.isPending}
        onSubmitCreate={(values) =>
          createCourse.mutate(values, {
            onSuccess: () => {
              toast.success(t('admin.coursesPage.created'))
              setDialogOpen(false)
            },
            onError: () => toast.error(t('admin.coursesPage.createError')),
          })
        }
        onSubmitUpdate={(id, values) =>
          updateCourse.mutate(
            { id, data: values },
            {
              onSuccess: () => {
                toast.success(t('admin.coursesPage.updated'))
                setDialogOpen(false)
              },
              onError: () => toast.error(t('admin.coursesPage.updateError')),
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
            <DialogTitle>{t('admin.coursesPage.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('admin.coursesPage.deleteConfirm', {
                title: deleteTarget?.title,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface CourseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: Course | null
  isCreating: boolean
  isUpdating: boolean
  onSubmitCreate: (data: CreateCoursePayload) => void
  onSubmitUpdate: (id: number, data: UpdateCoursePayload) => void
}

function CourseFormDialog({
  open,
  onOpenChange,
  course,
  isCreating,
  isUpdating,
  onSubmitCreate,
  onSubmitUpdate,
}: CourseFormDialogProps) {
  const { t } = useTranslation()
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(makeCourseFormSchema(t)),
    defaultValues: course ? toFormValues(course) : emptyValues,
  })

  useEffect(() => {
    if (open) {
      form.reset(course ? toFormValues(course) : emptyValues)
    }
  }, [open, course, form])

  const handleSubmit = (values: CourseFormValues) => {
    const semester = values.semester === '' ? null : Number(values.semester)
    const credits = values.credits === '' ? null : Number(values.credits)
    if (course) {
      onSubmitUpdate(course.id, {
        title: values.title,
        description: values.description || null,
        semester,
        credits,
        category: values.category,
      })
    } else {
      onSubmitCreate({
        title: values.title,
        slug: values.slug,
        description: values.description || null,
        semester,
        credits,
        category: values.category,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {course
              ? t('admin.coursesPage.editTitle')
              : t('admin.coursesPage.newTitle')}
          </DialogTitle>
          <DialogDescription>
            {course
              ? t('admin.coursesPage.editDesc')
              : t('admin.coursesPage.newDesc')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.coursesPage.titleLabel')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.coursesPage.slugLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={course !== null}
                      placeholder={t('admin.coursesPage.slugPlaceholder')}
                    />
                  </FormControl>
                  {course && (
                    <FormDescription>
                      {t('admin.coursesPage.slugDisabled')}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('admin.coursesPage.descriptionLabel')}
                  </FormLabel>
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
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('admin.coursesPage.semesterLabel')}
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={8} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="credits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('admin.coursesPage.creditsLabel')}
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('admin.coursesPage.categoryLabel')}
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('admin.coursesPage.categoryPlaceholder')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COURSE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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
                {isCreating || isUpdating
                  ? t('common.saving')
                  : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
