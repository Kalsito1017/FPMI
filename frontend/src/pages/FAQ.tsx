import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const faqKeys = [
  { categoryKey: 'general', itemKeys: ['whatIs', 'whoCanUse'] },
  { categoryKey: 'content', itemKeys: ['howContribute', 'howApproval', 'whatIsWiki'] },
  { categoryKey: 'courses', itemKeys: ['whatCourses'] },
  { categoryKey: 'forums', itemKeys: ['hasForum'] },
  { categoryKey: 'support', itemKeys: ['howReport', 'howReportContent'] },
  { categoryKey: 'dev', itemKeys: ['isOpenSource', 'howContributeDev'] },
] as const

export function FAQ() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<string | null>(null)

  const faqs = faqKeys.map((section) => ({
    category: t(`faq.categories.${section.categoryKey}`),
    items: section.itemKeys.map((itemKey) => ({
      q: t(`faq.items.${itemKey}.q`),
      a: t(`faq.items.${itemKey}.a`),
    })),
  }))

  const filtered = faqs
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.q.toLowerCase().includes(query.toLowerCase()) ||
          item.a.toLowerCase().includes(query.toLowerCase()),
      ),
    }))
    .filter((s) => s.items.length > 0)

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t('faq.title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('faq.subtitle')}</p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('faq.searchPlaceholder')}
          className="pl-9"
        />
      </div>

      <div className="space-y-8">
        {filtered.map((section) => (
          <section key={section.category}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {section.category}
            </h2>
            <div className="divide-y rounded-lg border">
              {section.items.map((item) => {
                const id = `${section.category}:${item.q}`
                const isOpen = open === id
                return (
                  <div key={id}>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : id)}
                      className="flex w-full items-center justify-between gap-2 px-5 py-4 text-left text-sm font-medium transition-colors hover:bg-muted/50"
                    >
                      {item.q}
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                          isOpen && 'rotate-180',
                        )}
                      />
                    </button>
                    <div
                      className={cn(
                        'overflow-hidden transition-all',
                        isOpen ? 'max-h-96' : 'max-h-0',
                      )}
                    >
                      <p className="border-t px-5 py-4 text-sm text-muted-foreground">
                        {item.a}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            {t('faq.noResults', { query })}
          </div>
        )}
      </div>
    </div>
  )
}
