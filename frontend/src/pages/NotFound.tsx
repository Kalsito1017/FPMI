import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-5xl font-bold tracking-tight text-muted-foreground">
        {t('notFound.code')}
      </p>
      <h1 className="mt-4 text-2xl font-semibold">{t('notFound.title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('notFound.description')}</p>
      <Button asChild className="mt-6">
        <Link to="/">{t('notFound.home')}</Link>
      </Button>
    </div>
  )
}
