import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/use-auth'
import { updateProfile, changePassword } from '@/api/auth'
import { fetchTUSofiaSpecialties } from '@/api/courses'
import type { TUSofiaSpecialty } from '@/api/courses'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const profileSchema = z.object({
  name: z.string().min(1),
  specialty: z.string().optional(),
  hobbies: z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
  confirmNewPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
})

type ProfileValues = z.infer<typeof profileSchema>
type PasswordValues = z.infer<typeof passwordSchema>

export function Profile() {
  const { t } = useTranslation()
  const { user, setUser } = useAuth()
  const [savingName, setSavingName] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [specialties, setSpecialties] = useState<string[]>([])
  const [specsLoading, setSpecsLoading] = useState(true)
  const [specsFailed, setSpecsFailed] = useState(false)

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
        setSpecsLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setSpecsFailed(true)
        setSpecsLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name ?? '',
      specialty: user?.specialty ?? '',
      hobbies: user?.hobbies ?? '',
    },
  })

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  const onProfileSubmit = async (values: ProfileValues) => {
    setSavingName(true)
    try {
      const data: Record<string, string> = {}
      if (values.name) data.name = values.name
      if (values.specialty) data.specialty = values.specialty
      if (values.hobbies) data.hobbies = values.hobbies
      const { user: updated } = await updateProfile(data)
      setUser(updated)
      toast.success(t('profile.nameUpdated'))
    } catch {
      toast.error(t('profile.nameError'))
    } finally {
      setSavingName(false)
    }
  }

  const onPasswordSubmit = async (values: PasswordValues) => {
    setSavingPassword(true)
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      })
      toast.success(t('profile.passwordUpdated'))
    } catch {
      toast.error(t('profile.passwordError'))
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.title')}</CardTitle>
          <CardDescription>{t('profile.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">
                {t('profile.tabProfile')}
              </TabsTrigger>
              <TabsTrigger value="security">
                {t('profile.tabSecurity')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('profile.name')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="text-sm text-muted-foreground">
                    {t('profile.email')}: {user?.email}
                  </div>
                  {user?.role === 'STUDENT' && (
                    <>
                      <FormField
                        control={profileForm.control}
                        name="specialty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('profile.specialty')}</FormLabel>
                            <FormControl>
                              {specsFailed || specsLoading ? (
                                <Input
                                  {...field}
                                  placeholder={
                                    specsLoading
                                      ? t('auth.register.specialtyLoading')
                                      : t('profile.specialtyPlaceholder')
                                  }
                                  disabled={specsLoading}
                                />
                              ) : (
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={t('profile.specialtyPlaceholder')}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {specialties.map((s) => (
                                      <SelectItem key={s} value={s}>
                                        {s}
                                      </SelectItem>
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
                        control={profileForm.control}
                        name="hobbies"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('profile.hobbies')}</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder={t('profile.hobbiesPlaceholder')}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  <Button type="submit" disabled={savingName}>
                    {savingName
                      ? t('profile.saving')
                      : t('profile.saveName')}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="security">
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('profile.currentPassword')}
                        </FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('profile.newPassword')}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmNewPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('profile.confirmNewPassword')}
                        </FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={savingPassword}>
                    {savingPassword
                      ? t('profile.saving')
                      : t('profile.savePassword')}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
