import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { App } from '@/App'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AuthInit } from '@/components/AuthInit'
import { initTheme } from '@/store/theme-store'
import { initLang } from '@/store/lang-store'
import './i18n/config'
import './index.css'

initTheme()
initLang()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthInit><App /></AuthInit>
      </ErrorBoundary>
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
)
