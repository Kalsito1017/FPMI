import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import {
  useCreateProfessor,
  useDeleteProfessor,
  useProfessors,
  useUpdateProfessor,
} from '@/hooks/use-professors'
import type { Professor } from '@/types'
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function makeProfessorFormSchema(t: (key: string, opts?: Record<string, unknown>) => string) {
  return z.object({
    name: z.string().min(1, t('admin.professorsPage.errors.nameRequired')),
    email: z
      .string()
      .email(t('admin.professorsPage.errors.validEmail'))
      .optional()
      .or(z.literal('')),
    office: z.string().optional(),
    bio: z.string().optional(),
    photo: z.string().optional(),
  })
}

type ProfessorFormValues = z.infer<ReturnType<typeof makeProfessorFormSchema>>

const emptyValues: ProfessorFormValues = {
  name: '',
  email: '',
  office: '',
  bio: '',
  photo: '',
}

function toFormValues(professor: Professor): ProfessorFormValues {
  return {
    name: professor.name,
    email: professor.email ?? '',
    office: professor.office ?? '',
    bio: professor.bio ?? '',
    photo: professor.photo ?? '',
  }
}

type ProfessorPayload = {
  name: string
  email: string | null
  office: string | null
  bio: string | null
  photo: string | null
}

function toPayload(values: ProfessorFormValues): ProfessorPayload {
  return {
    name: values.name,
    email: values.email || null,
    office: values.office || null,
    bio: values.bio || null,
    photo: values.photo || null,
  }
}

export function AdminProfessors() {
  const { t } = useTranslation()
  const { data: professors, isLoading } = useProfessors()
  const createProfessor = useCreateProfessor()
  const updateProfessor = useUpdateProfessor()
  const deleteProfessor = useDeleteProfessor()

  const [editing, setEditing] = useState<Professor | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Professor | null>(null)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (professor: Professor) => {
    setEditing(professor)
    setDialogOpen(true)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteProfessor.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(t('admin.professorsPage.deleted'))
        setDeleteTarget(null)
      },
      onError: () => toast.error(t('admin.professorsPage.deleteError')),
    })
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.professorsPage.title')}</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t('admin.professorsPage.newProfessor')}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.professorsPage.nameCol')}</TableHead>
              <TableHead>{t('admin.professorsPage.emailCol')}</TableHead>
              <TableHead>{t('admin.professorsPage.officeCol')}</TableHead>
              <TableHead className="text-right">{t('admin.professorsPage.actionsCol')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  {t('admin.professorsPage.loading')}
                </TableCell>
              </TableRow>
            ) : (professors ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  {t('admin.professorsPage.noProfessors')}
                </TableCell>
              </TableRow>
            ) : (
              professors!.map((professor) => (
                <TableRow key={professor.id}>
                  <TableCell className="font-medium">{professor.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {professor.email ?? '—'}
                  </TableCell>
                  <TableCell>{professor.office ?? '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(professor)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(professor)}
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

      <ProfessorFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        professor={editing}
        isCreating={createProfessor.isPending}
        isUpdating={updateProfessor.isPending}
        onSubmitCreate={(payload) =>
          createProfessor.mutate(payload, {
            onSuccess: () => {
              toast.success(t('admin.professorsPage.created'))
              setDialogOpen(false)
            },
            onError: () => toast.error(t('admin.professorsPage.createError')),
          })
        }
        onSubmitUpdate={(id, payload) =>
          updateProfessor.mutate(
            { id, data: payload },
            {
              onSuccess: () => {
                toast.success(t('admin.professorsPage.updated'))
                setDialogOpen(false)
              },
              onError: () => toast.error(t('admin.professorsPage.updateError')),
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
            <DialogTitle>{t('admin.professorsPage.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('admin.professorsPage.deleteConfirm', { name: deleteTarget?.name })}
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

interface ProfessorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  professor: Professor | null
  isCreating: boolean
  isUpdating: boolean
  onSubmitCreate: (data: ProfessorPayload) => void
  onSubmitUpdate: (id: number, data: ProfessorPayload) => void
}

function ProfessorFormDialog({
  open,
  onOpenChange,
  professor,
  isCreating,
  isUpdating,
  onSubmitCreate,
  onSubmitUpdate,
}: ProfessorFormDialogProps) {
  const { t } = useTranslation()
  const form = useForm<ProfessorFormValues>({
    resolver: zodResolver(makeProfessorFormSchema(t)),
    defaultValues: professor ? toFormValues(professor) : emptyValues,
  })

  useEffect(() => {
    if (open) {
      form.reset(professor ? toFormValues(professor) : emptyValues)
    }
  }, [open, professor, form])

  const handleSubmit = (values: ProfessorFormValues) => {
    const payload = toPayload(values)
    if (professor) {
      onSubmitUpdate(professor.id, payload)
    } else {
      onSubmitCreate(payload)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {professor ? t('admin.professorsPage.editTitle') : t('admin.professorsPage.newTitle')}
          </DialogTitle>
          <DialogDescription>
            {professor
              ? t('admin.professorsPage.editDesc')
              : t('admin.professorsPage.newDesc')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.professorsPage.nameLabel')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.professorsPage.emailLabel')}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="office"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.professorsPage.officeLabel')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.professorsPage.bioLabel')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="photo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.professorsPage.photoLabel')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
