import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '@/i18n/config'
import { LANG_STORAGE_KEY } from '@/lib/constants'

export type Language = 'bg' | 'en'

interface LangState {
  lang: Language
  setLang: (lang: Language) => void
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: 'bg',
      setLang: (lang) => {
        void i18n.changeLanguage(lang)
        document.documentElement.lang = lang
        set({ lang })
      },
    }),
    {
      name: LANG_STORAGE_KEY,
      partialize: (state) => ({ lang: state.lang }),
    },
  ),
)

export function initLang(): void {
  const lang = useLangStore.getState().lang
  i18n.changeLanguage(lang)
  document.documentElement.lang = lang
}
