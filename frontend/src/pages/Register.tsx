import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Turnstile } from '@marsidev/react-turnstile'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { register } from '@/api/auth'
import { fetchTUSofiaSpecialties } from '@/api/courses'
import type { TUSofiaSpecialty } from '@/api/courses'
import { useAuthStore } from '@/store/auth-store'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RoleSelector } from '@/components/RoleSelector'

const registerSchema = z.object({
  role: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  specialty: z.string().optional(),
  hobbies: z.string().optional(),
})

type RegisterValues = z.infer<typeof registerSchema>

function useSpecialties() {
  const [specialties, setSpecialties] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchTUSofiaSpecialties()
      .then((data) => {
        if (cancelled) return
        const all = [
          ...data.bachelor.map((s: TUSofiaSpecialty) => s.name),
          ...data.master.map((s: TUSofiaSpecialty) => s.name),
        ].sort((a, b) => a.localeCompare(b, 'bg'))
        setSpecialties(all)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setFailed(true)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return { specialties, loading, failed }
}

export function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)
  const [step, setStep] = useState(0)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [fadeIn, setFadeIn] = useState(true)
  const { specialties, loading: specsLoading, failed: specsFailed } = useSpecialties()

  const isStudent = (role: string) => role === 'STUDENT'

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'GUEST', name: '', email: '', password: '', specialty: '', hobbies: '' },
    mode: 'onChange',
  })

  const selectedRole = form.watch('role')

  const changeStep = useCallback((newStep: number) => {
    setFadeIn(false)
    setTimeout(() => {
      setStep(newStep)
      setFadeIn(true)
    }, 150)
  }, [])

  const canNextStep = useMemo(() => {
    if (step === 0) return !!selectedRole
    if (step === 1) {
      const { name, email, password } = form.getValues()
      const nameOk = name.length >= 1
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      const passOk = password.length >= 8
      return nameOk && emailOk && passOk
    }
    return true
  }, [step, selectedRole, form])

  const onNext = () => {
    if (isStudent(selectedRole)) {
      changeStep(step + 1)
    } else {
      onSubmit()
    }
  }

  const onSubmit = async () => {
    const values = form.getValues()
    try {
      const { user } = await register({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        specialty: isStudent(values.role) ? values.specialty : undefined,
        hobbies: values.hobbies || undefined,
        turnstileToken,
      })
      setUser(user)
      navigate('/', { replace: true })
    } catch {
      toast.error(t('auth.register.error'))
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>{t('auth.register.title')}</CardTitle>
          <CardDescription>{t('auth.register.description')}</CardDescription>
          {step >= 0 && (
            <div className="flex gap-1 pt-2">
              {[0, 1, ...(isStudent(selectedRole) ? [2] : [])].map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    s <= step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div
              className={`transition-all duration-150 ${
                fadeIn ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
              }`}
            >
              {step === 0 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RoleSelector value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    className="w-full"
                    onClick={onNext}
                    disabled={!selectedRole}
                  >
                    {t('auth.register.next')}
                  </Button>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.register.name')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.register.email')}</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.register.password')}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Turnstile
                    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA0000000000000000000'}
                    onSuccess={(token: string | null) => setTurnstileToken(token ?? '')}
                  />
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => changeStep(0)} className="flex-1">
                      {t('auth.register.back')}
                    </Button>
                    <Button type="button" className="flex-1" onClick={onNext} disabled={!canNextStep}>
                      {isStudent(selectedRole) ? t('auth.register.next') : t('auth.register.finish')}
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && isStudent(selectedRole) && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="specialty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.register.specialty')}</FormLabel>
                        <FormControl>
                          {specsFailed || specsLoading ? (
                            <Input
                              {...field}
                              placeholder={
                                specsLoading
                                  ? t('auth.register.specialtyLoading')
                                  : t('auth.register.specialtyPlaceholder')
                              }
                              disabled={specsLoading}
                            />
                          ) : (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={t('auth.register.specialtyPlaceholder')} />
                              </SelectTrigger>
                              <SelectContent>
                                {specialties.map((s) => (
                                  <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hobbies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.register.hobbies')}</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder={t('auth.register.hobbiesPlaceholder')} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => changeStep(1)} className="flex-1">
                      {t('auth.register.back')}
                    </Button>
                    <Button
                      type="button"
                      className="flex-1"
                      onClick={onSubmit}
                      disabled={form.formState.isSubmitting || (isStudent(selectedRole) && !form.getValues().specialty)}
                    >
                      {form.formState.isSubmitting
                        ? t('auth.register.submitting')
                        : t('auth.register.finish')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <span>{t('auth.register.hasAccount')}</span>{' '}
            <Link to="/login" className="font-medium underline">
              {t('auth.register.login')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
