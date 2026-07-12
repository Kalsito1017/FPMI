import { type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { login } from '@/api/auth'
import { useAuth } from '@/hooks/use-auth'
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

function makeLoginSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().trim().email(t('auth.errors.validEmail')),
    password: z.string().min(8, t('auth.errors.passwordMin')),
  })
}

type LoginValues = z.infer<ReturnType<typeof makeLoginSchema>>

export function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser } = useAuth()

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname ?? '/'

  const form = useForm<LoginValues>({
    resolver: zodResolver(makeLoginSchema(t)),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginValues) => {
    try {
      const { user } = await login(values)
      setUser(user)
      navigate(from, { replace: true })
    } catch {
      toast.error(t('auth.login.error'))
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>{t('auth.login.title')}</CardTitle>
          <CardDescription>{t('auth.login.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.login.email')}</FormLabel>
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
                    <FormLabel>{t('auth.login.password')}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-muted-foreground underline hover:text-foreground"
                >
                  {t('auth.login.forgotPassword')}
                </Link>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? t('auth.login.submitting')
                  : t('auth.login.submit')}
              </Button>
            </form>
          </Form>
          <AuthFooter>
            <span>{t('auth.login.noAccount')}</span>{' '}
            <Link to="/register" className="font-medium underline">
              {t('auth.login.register')}
            </Link>
          </AuthFooter>
        </CardContent>
      </Card>
    </div>
  )
}

function AuthFooter({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-center text-sm text-muted-foreground">{children}</p>
}
