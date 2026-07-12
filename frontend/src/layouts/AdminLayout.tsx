import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const sidebarLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-accent text-accent-foreground'
      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
  )

export function AdminLayout() {
  const { t } = useTranslation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebar = (
    <>
      <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t('admin.title')}
      </h2>
      <nav className="space-y-1">
        <NavLink to="/admin/courses" className={sidebarLinkClass} onClick={() => setMobileOpen(false)}>
          {t('admin.courses')}
        </NavLink>
        <NavLink to="/admin/professors" className={sidebarLinkClass} onClick={() => setMobileOpen(false)}>
          {t('admin.professors')}
        </NavLink>
        <NavLink to="/admin/users" className={sidebarLinkClass} onClick={() => setMobileOpen(false)}>
          {t('admin.users')}
        </NavLink>
        <NavLink to="/admin/import-export" className={sidebarLinkClass} onClick={() => setMobileOpen(false)}>
          {t('admin.importExport')}
        </NavLink>
        <NavLink to="/admin/analytics" className={sidebarLinkClass} onClick={() => setMobileOpen(false)}>
          {t('admin.analytics')}
        </NavLink>
        <NavLink to="/admin/announcements" className={sidebarLinkClass} onClick={() => setMobileOpen(false)}>
          {t('admin.announcements')}
        </NavLink>
      </nav>
      <Link
        to="/"
        className="mt-4 block px-3 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => setMobileOpen(false)}
      >
        {t('admin.backToSite')}
      </Link>
    </>
  )

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
      <button
        type="button"
        className="fixed left-4 top-4 z-50 rounded-md border bg-background p-2 sm:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 sm:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'w-48 shrink-0',
          'fixed bottom-0 left-0 top-0 z-40 border-r bg-background p-4 transition-transform sm:static sm:border-r-0 sm:p-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0',
        )}
      >
        {sidebar}
      </aside>

      <div className="min-w-0 flex-1 pt-10 sm:pt-0">
        <Outlet />
      </div>
    </div>
  )
}
