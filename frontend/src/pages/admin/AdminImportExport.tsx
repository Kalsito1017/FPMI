import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Download, Upload, FileSpreadsheet } from 'lucide-react'
import { useExportCourses, useImportCourses } from '@/hooks/use-courses'
import type { ImportResult } from '@/api/courses'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function AdminImportExport() {
  const { t } = useTranslation()
  const exportMutation = useExportCourses()
  const importMutation = useImportCourses()
  const fileRef = useRef<HTMLInputElement>(null)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'courses.csv'
      a.click()
      URL.revokeObjectURL(url)
      toast.success(t('admin.importExport.exportBtn'))
    } catch {
      toast.error(t('admin.importExport.exportError') || 'Export failed')
    }
  }

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const res = await importMutation.mutateAsync(file)
      setResult(res)
      toast.success(
        t('admin.importExport.importSuccess', {
          created: res.created,
          skipped: res.skipped,
        }),
      )
    } catch {
      toast.error(t('admin.importExport.importError'))
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        {t('admin.importExport.title')}
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              {t('admin.importExport.exportTitle')}
            </CardTitle>
            <CardDescription>
              {t('admin.importExport.exportDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleExport}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending
                ? t('admin.importExport.exporting')
                : t('admin.importExport.exportBtn')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              {t('admin.importExport.importTitle')}
            </CardTitle>
            <CardDescription>
              {t('admin.importExport.importDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              onClick={() => fileRef.current?.click()}
              disabled={importMutation.isPending}
            >
              {importMutation.isPending
                ? t('admin.importExport.importing')
                : t('admin.importExport.importBtn')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              {t('admin.importExport.results')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <span className="font-medium">
                {t('admin.importExport.created')}: {result.created}
              </span>
              <span className="font-medium">
                {t('admin.importExport.skipped')}: {result.skipped}
              </span>
              <span className="font-medium">
                {t('admin.importExport.errors')}: {result.errors.length}
              </span>
            </div>
            {result.errors.length > 0 && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.importExport.row')}</TableHead>
                      <TableHead>{t('admin.importExport.errors')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.errors.map((err, i) => (
                      <TableRow key={i}>
                        <TableCell>{err.row}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {err.message}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
