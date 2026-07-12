import { Mail, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useProfessors } from '@/hooks/use-professors'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function Professors() {
  const { t } = useTranslation()
  const { data: professors, isLoading } = useProfessors()

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">
        {t('professors.title')}
      </h1>
      {isLoading ? (
        <p className="text-muted-foreground">{t('professors.loading')}</p>
      ) : (professors ?? []).length === 0 ? (
        <p className="text-muted-foreground">{t('professors.noProfessors')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {professors!.map((professor) => (
            <Card key={professor.id} className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">{professor.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {professor.office && (
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {professor.office}
                  </p>
                )}
                {professor.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {professor.email}
                  </p>
                )}
                {professor.bio && (
                  <p className="line-clamp-3 pt-1">{professor.bio}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
