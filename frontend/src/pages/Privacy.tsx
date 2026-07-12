import { useTranslation } from 'react-i18next'

export function Privacy() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{t('privacy.title')}</h1>
      <p className="text-muted-foreground mb-8">{t('privacy.lastUpdated')}</p>
      <div className="prose prose-sm max-w-none space-y-4 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">1. {t('privacy.dataCollected.title')}</h2>
          <p>{t('privacy.dataCollected.body')}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">2. {t('privacy.cookies.title')}</h2>
          <p>{t('privacy.cookies.body')}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">3. {t('privacy.purpose.title')}</h2>
          <p>{t('privacy.purpose.body')}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">4. {t('privacy.thirdParty.title')}</h2>
          <p>{t('privacy.thirdParty.body')}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">5. {t('privacy.rights.title')}</h2>
          <p>{t('privacy.rights.body')}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">6. {t('privacy.retention.title')}</h2>
          <p>{t('privacy.retention.body')}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">7. {t('privacy.contact.title')}</h2>
          <p>{t('privacy.contact.body')}</p>
        </section>
      </div>
    </div>
  )
}
