import { User, GraduationCap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface RoleOption {
  value: string
  icon: React.ReactNode
  title: string
  description: string
  features?: string
}

interface RoleSelectorProps {
  value?: string
  onChange: (value: string) => void
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  const { t } = useTranslation()

  const roles: RoleOption[] = [
    {
      value: 'GUEST',
      icon: <User className="h-6 w-6" />,
      title: t('auth.roles.guest'),
      description: t('auth.roles.guestDesc'),
    },
    {
      value: 'STUDENT',
      icon: <GraduationCap className="h-6 w-6" />,
      title: t('auth.roles.student'),
      description: t('auth.roles.studentDesc'),
      features: t('auth.roles.studentFeatures'),
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {roles.map((role) => {
        const selected = value === role.value
        return (
          <button
            key={role.value}
            type="button"
            onClick={() => onChange(role.value)}
            className={cn(
              'relative flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-all',
              selected
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-muted bg-transparent hover:border-muted-foreground/30',
            )}
          >
            {selected && (
              <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                &#10003;
              </span>
            )}
            <span
              className={cn(
                'rounded-full p-2',
                selected
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {role.icon}
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold">{role.title}</p>
              <p className="text-xs text-muted-foreground">{role.description}</p>
              {role.features && (
                <p className="pt-1 text-xs text-muted-foreground/70">
                  {role.features}
                </p>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
