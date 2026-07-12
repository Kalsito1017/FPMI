import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { cn } from '@/lib/utils'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'text-sm font-medium transition-colors hover:text-foreground',
    isActive ? 'text-foreground' : 'text-muted-foreground',
  )

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinks = (
    <>
      <NavLink to="/" end className={navLinkClass} onClick={() => setMobileOpen(false)}>
        {t('nav.home')}
      </NavLink>
      <NavLink to="/courses" className={navLinkClass} onClick={() => setMobileOpen(false)}>
        {t('nav.courses')}
      </NavLink>
      <NavLink to="/announcements" className={navLinkClass} onClick={() => setMobileOpen(false)}>
        {t('nav.announcements')}
      </NavLink>
      <NavLink to="/community" className={navLinkClass} onClick={() => setMobileOpen(false)}>
        {t('nav.community')}
      </NavLink>
      <NavLink to="/professors" className={navLinkClass} onClick={() => setMobileOpen(false)}>
        {t('nav.professors')}
      </NavLink>
      <NavLink to="/faq" className={navLinkClass} onClick={() => setMobileOpen(false)}>
        {t('nav.faq')}
      </NavLink>
      <NavLink to="/contact" className={navLinkClass} onClick={() => setMobileOpen(false)}>
        {t('nav.contact')}
      </NavLink>
    </>
  )

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="ФПМИ Курсове" className="h-14 w-auto" />
          </Link>
          <nav className="hidden items-center gap-6 sm:flex">
            {navLinks}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:flex sm:items-center sm:gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="hidden text-sm text-muted-foreground underline hover:text-foreground md:inline"
              >
                {user?.name}
              </Link>
              {user?.role === 'ADMIN' && (
                <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                  <Link to="/admin/courses">{t('nav.admin')}</Link>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout} className="hidden sm:inline-flex">
                {t('nav.logout')}
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/login">{t('nav.login')}</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link to="/register">{t('nav.register')}</Link>
              </Button>
            </>
          )}
          <button
            type="button"
            className="rounded-md border p-2 sm:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 sm:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          'fixed bottom-0 right-0 top-20 z-30 flex w-64 flex-col gap-4 border-l bg-background p-6 shadow-lg transition-transform sm:hidden',
          mobileOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center gap-2 border-b pb-4">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
        <nav className="flex flex-col gap-3">
          {navLinks}
        </nav>
        <div className="mt-auto border-t pt-4">
          {isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <Link
                to="/profile"
                className="text-sm text-muted-foreground underline hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {user?.name}
              </Link>
              {user?.role === 'ADMIN' && (
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin/courses" onClick={() => setMobileOpen(false)}>{t('nav.admin')}</Link>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => { handleLogout(); setMobileOpen(false) }}>
                {t('nav.logout')}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/login" onClick={() => setMobileOpen(false)}>{t('nav.login')}</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register" onClick={() => setMobileOpen(false)}>{t('nav.register')}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
