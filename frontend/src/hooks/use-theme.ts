import { useEffect } from 'react'
import {
  useThemeStore,
  applyTheme,
  resolveTheme,
  type ThemeMode,
} from '@/store/theme-store'

export function useTheme() {
  const mode = useThemeStore((s) => s.mode)
  const setMode = useThemeStore((s) => s.setMode)
  const resolved = resolveTheme(mode)

  useEffect(() => {
    applyTheme(mode)

    if (mode === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme('system')
      mql.addEventListener('change', handler)
      return () => mql.removeEventListener('change', handler)
    }
  }, [mode])

  return {
    mode,
    setMode: (m: ThemeMode) => setMode(m),
    resolved,
  }
}
