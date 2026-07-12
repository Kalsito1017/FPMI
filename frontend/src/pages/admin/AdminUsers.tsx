import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useUpdateUserRole, useUsers } from '@/hooks/use-users'
import { ROLES, type Role } from '@/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function AdminUsers() {
  const { t } = useTranslation()
  const { data: users, isLoading } = useUsers()
  const updateUserRole = useUpdateUserRole()

  const handleChangeRole = (id: number, role: Role) => {
    updateUserRole.mutate(
      { id, role },
      {
        onSuccess: () => toast.success(t('admin.usersPage.roleUpdated')),
        onError: () => toast.error(t('admin.usersPage.roleUpdateError')),
      },
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {t('admin.usersPage.title')}
        </h1>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.usersPage.nameCol')}</TableHead>
              <TableHead>{t('admin.usersPage.emailCol')}</TableHead>
              <TableHead>{t('admin.usersPage.roleCol')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground">
                  {t('admin.usersPage.loading')}
                </TableCell>
              </TableRow>
            ) : (users ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground">
                  {t('admin.usersPage.noUsers')}
                </TableCell>
              </TableRow>
            ) : (
              users!.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) =>
                        handleChangeRole(user.id, value as Role)
                      }
                    >
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
