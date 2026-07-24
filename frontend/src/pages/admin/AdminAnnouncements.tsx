import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAnnouncements, useCreateAnnouncement, useDeleteAnnouncement, useTriggerScrape } from '@/hooks/use-announcements'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogoLoader } from '@/components/LogoLoader'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { AnnouncementSource } from '@/types'

const sourceLabel: Record<AnnouncementSource, string> = {
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  university: 'University',
  manual: 'Manual',
}

const sources: AnnouncementSource[] = ['facebook', 'linkedin', 'university', 'manual']

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  source: z.enum(['facebook', 'linkedin', 'university', 'manual']),
  sourceUrl: z.string().optional(),
  publishedAt: z.string().min(1, 'Date is required'),
})

type FormValues = z.infer<typeof formSchema>

export function AdminAnnouncements() {
  const { t } = useTranslation()
  const { data: announcements, isLoading } = useAnnouncements()
  const createAnnouncement = useCreateAnnouncement()
  const deleteAnnouncement = useDeleteAnnouncement()
  const triggerScrape = useTriggerScrape()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [open, setOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      source: 'manual',
      sourceUrl: '',
      publishedAt: new Date().toISOString().slice(0, 10),
    },
  })

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await deleteAnnouncement.mutateAsync(id)
      toast.success(t('admin.announcementsPage.deleted'))
    } catch {
      toast.error(t('admin.announcementsPage.deleteError'))
    } finally {
      setDeletingId(null)
    }
  }

  const handleScrape = async () => {
    try {
      const result = await triggerScrape.mutateAsync()
      const total = result.scraped.reduce((s, r) => s + r.added, 0)
      toast.success(`Scraped ${total} new announcement(s)`)
    } catch {
      toast.error('Scrape failed')
    }
  }

  const onSubmit = async (values: FormValues) => {
    try {
      await createAnnouncement.mutateAsync({
        title: values.title,
        content: values.content || undefined,
        source: values.source,
        sourceUrl: values.sourceUrl || undefined,
        publishedAt: new Date(values.publishedAt).toISOString(),
      })
      toast.success(t('admin.announcementsPage.created'))
      setOpen(false)
      form.reset()
    } catch {
      toast.error(t('admin.announcementsPage.createError'))
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('admin.announcementsPage.title')}</h1>
        <div className="flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('admin.announcementsPage.new')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('admin.announcementsPage.newTitle')}</DialogTitle>
                <DialogDescription>{t('admin.announcementsPage.newDesc')}</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.announcementsPage.titleLabel')}</FormLabel>
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
                        <FormLabel>{t('admin.announcementsPage.contentLabel')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.announcementsPage.sourceLabel')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sources.map((s) => (
                              <SelectItem key={s} value={s}>
                                {sourceLabel[s]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sourceUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.announcementsPage.sourceUrlLabel')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="publishedAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.announcementsPage.dateLabel')}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={createAnnouncement.isPending}>
                      {t('common.save')}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <Button onClick={handleScrape} disabled={triggerScrape.isPending} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${triggerScrape.isPending ? 'animate-spin' : ''}`} />
            {t('admin.announcementsPage.scrapeNow')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.announcementsPage.listTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LogoLoader label />
            </div>
          ) : !announcements || announcements.length === 0 ? (
            <p className="text-muted-foreground">{t('admin.announcementsPage.empty')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.announcementsPage.titleCol')}</TableHead>
                  <TableHead>{t('admin.announcementsPage.sourceCol')}</TableHead>
                  <TableHead>{t('admin.announcementsPage.dateCol')}</TableHead>
                  <TableHead className="w-20">{t('admin.announcementsPage.actionsCol')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell>{sourceLabel[a.source as AnnouncementSource] ?? a.source}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(a.publishedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(a.id)}
                        disabled={deletingId === a.id}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
