import { useTranslation } from 'react-i18next'
import { ExternalLink, Newspaper, Globe, MessageCircle, Briefcase } from 'lucide-react'
import { useAnnouncements } from '@/hooks/use-announcements'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { AnnouncementSource } from '@/types'

const sourceConfig: Record<AnnouncementSource, { icon: typeof Newspaper; label: string; color: string }> = {
  facebook: { icon: MessageCircle, label: 'announcements.sourceFacebook', color: 'text-blue-600' },
  linkedin: { icon: Briefcase, label: 'announcements.sourceLinkedin', color: 'text-blue-700' },
  university: { icon: Globe, label: 'announcements.sourceUniversity', color: 'text-green-600' },
  manual: { icon: Newspaper, label: 'announcements.sourceManual', color: 'text-muted-foreground' },
}

export function Announcements() {
  const { t } = useTranslation()
  const { data: announcements, isLoading } = useAnnouncements()

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold">{t('announcements.title')}</h1>
      <p className="mb-8 text-muted-foreground">{t('announcements.subtitle')}</p>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : !announcements || announcements.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('announcements.empty')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t('announcements.emptyDesc')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => {
            const cfg = sourceConfig[a.source as AnnouncementSource] ?? sourceConfig.manual
            const Icon = cfg.icon
            return (
              <Card key={a.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 shrink-0 ${cfg.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{t(cfg.label)}</span>
                        <span>·</span>
                        <span>{new Date(a.publishedAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-lg font-semibold">{a.title}</h3>
                      {a.content && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                          {a.content}
                        </p>
                      )}
                      {a.sourceUrl && (
                        <a
                          href={a.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          {t('announcements.readMore')}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
