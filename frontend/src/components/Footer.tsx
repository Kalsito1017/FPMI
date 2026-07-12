import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
        <p>{t('footer.copyright')}</p>
        <div className="flex items-center gap-4">
          <Link to="/terms" className="transition-colors hover:text-foreground">{t('footer.terms')}</Link>
          <Link to="/privacy" className="transition-colors hover:text-foreground">{t('footer.privacy')}</Link>
          <a
            href="https://github.com/Kalsito1017/FPMI"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
