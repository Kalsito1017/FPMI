import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { register } from '@/api/auth'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function makeRegisterSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(1, t('auth.errors.nameRequired')),
    email: z.string().email(t('auth.errors.validEmail')),
    password: z.string().min(8, t('auth.errors.passwordMin')),
    role: z.string().optional(),
  })
}

type RegisterValues = z.infer<ReturnType<typeof makeRegisterSchema>>

export function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setUser, setToken } = useAuth()

  const form = useForm<RegisterValues>({
    resolver: zodResolver(makeRegisterSchema(t)),
    defaultValues: { name: '', email: '', password: '', role: 'GUEST' },
  })

  const onSubmit = async (values: RegisterValues) => {
    try {
      const { user, token } = await register(values)
      setUser(user)
      setToken(token)
      navigate('/', { replace: true })
    } catch {
      toast.error(t('auth.register.error'))
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>{t('auth.register.title')}</CardTitle>
          <CardDescription>{t('auth.register.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.roles.label')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GUEST">
                          {t('auth.roles.guest')} — {t('auth.roles.guestDesc')}
                        </SelectItem>
                        <SelectItem value="STUDENT">
                          {t('auth.roles.student')} — {t('auth.roles.studentDesc')}
                        </SelectItem>
                        <SelectItem value="TEACHER">
                          {t('auth.roles.teacher')} — {t('auth.roles.teacherDesc')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? t('auth.register.submitting')
                  : t('auth.register.submit')}
              </Button>
            </form>
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
