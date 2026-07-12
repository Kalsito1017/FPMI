import { useTranslation } from 'react-i18next'

export function Terms() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{t('terms.title')}</h1>
      <div className="prose prose-sm max-w-none space-y-4 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">1. {t('terms.acceptance.title')}</h2>
          <p>{t('terms.acceptance.body')}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">2. {t('terms.account.title')}</h2>
          <p>{t('terms.account.body')}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">3. {t('terms.content.title')}</h2>
          <p>{t('terms.content.body')}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">4. {t('terms.conduct.title')}</h2>
          <p>{t('terms.conduct.body')}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">5. {t('terms.disclaimer.title')}</h2>
          <p>{t('terms.disclaimer.body')}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-2">6. {t('terms.changes.title')}</h2>
          <p>{t('terms.changes.body')}</p>
        </section>
      </div>
    </div>
  )
}
