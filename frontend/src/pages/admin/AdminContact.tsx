import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Eye, Trash2 } from 'lucide-react'
import {
  useContactMessages,
  useResolveContactMessage,
  useDeleteContactMessage,
} from '@/hooks/use-contact'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogoLoader } from '@/components/LogoLoader'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import type { ContactMessage } from '@/api/contact'

const typeLabel: Record<string, string> = {
  SUGGESTION: 'Suggestion',
  FEATURE_REQUEST: 'Feature',
  BUG_REPORT: 'Bug',
  SPAM: 'Spam',
  OTHER: 'Other',
}

const statusColor: Record<string, string> = {
  OPEN: 'bg-yellow-100 text-yellow-800',
  READ: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-green-100 text-green-800',
}

export function AdminContact() {
  const { t } = useTranslation()
  const { data: messages, isLoading } = useContactMessages()
  const resolve = useResolveContactMessage()
  const del = useDeleteContactMessage()
  const [viewing, setViewing] = useState<ContactMessage | null>(null)

  const handleResolve = async (id: number) => {
    try {
      await resolve.mutateAsync(id)
      toast.success('Marked as resolved')
    } catch {
      toast.error('Failed to resolve')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await del.mutateAsync(id)
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{t('admin.contactPage.title')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.contactPage.listTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LogoLoader label />
            </div>
          ) : !messages || messages.length === 0 ? (
            <p className="text-muted-foreground">{t('admin.contactPage.empty')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.contactPage.typeCol')}</TableHead>
                  <TableHead>{t('admin.contactPage.subjectCol')}</TableHead>
                  <TableHead>{t('admin.contactPage.fromCol')}</TableHead>
                  <TableHead>{t('admin.contactPage.statusCol')}</TableHead>
                  <TableHead>{t('admin.contactPage.dateCol')}</TableHead>
                  <TableHead className="w-32">{t('admin.contactPage.actionsCol')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{typeLabel[m.type] ?? m.type}</TableCell>
                    <TableCell className="max-w-40 truncate font-medium">{m.subject}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {m.user?.name ?? 'Guest'}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${statusColor[m.status] ?? ''}`}>{m.status}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setViewing(m)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {m.status !== 'RESOLVED' && (
                          <Button variant="ghost" size="sm" onClick={() => handleResolve(m.id)}>
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewing?.subject}</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-semibold">Type:</span> {typeLabel[viewing.type] ?? viewing.type}
              </div>
              <div>
                <span className="font-semibold">From:</span>{' '}
                {viewing.user ? `${viewing.user.name} (${viewing.user.email})` : 'Guest'}
              </div>
              <div>
                <span className="font-semibold">Status:</span> {viewing.status}
              </div>
              <div>
                <span className="font-semibold">Date:</span>{' '}
                {new Date(viewing.createdAt).toLocaleString()}
              </div>
              <div className="rounded-md bg-muted p-3 whitespace-pre-wrap">
                {viewing.message}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
