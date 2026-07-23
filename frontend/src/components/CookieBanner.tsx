import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

const COOKIE_CONSENT_KEY = 'fpmi-cookie-consent'

function getInitialDismissed(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(COOKIE_CONSENT_KEY) === 'true'
}

export function CookieBanner() {
  const { t } = useTranslation()
  const [dismissed, setDismissed] = useState(getInitialDismissed)

  if (dismissed) return null

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true')
    setDismissed(true)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4 shadow-lg">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground">{t('cookieBanner.text')}</p>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleAccept}>{t('cookieBanner.accept')}</Button>
        </div>
      </div>
    </div>
  )
}
