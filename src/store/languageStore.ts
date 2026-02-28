import { create } from 'zustand'
import i18n from '../i18n'

export type Language = {
  code: string
  name: string
  nativeName: string
  flag: string
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'en-us', name: 'English (US)', nativeName: 'English (US)', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'es-mx', name: 'Spanish (Mexico)', nativeName: 'Español (México)', flag: '🇲🇽' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
]

const LS_KEY = 'apex-language'
const FIRST_LAUNCH_KEY = 'apex-lang-picked'

function getStoredLang(): string {
  try {
    return localStorage.getItem(LS_KEY) || 'en'
  } catch { return 'en' }
}

type State = {
  code: string
  currentName: string
  firstLaunchDone: boolean
  setLanguage: (code: string) => void
  markFirstLaunchDone: () => void
}

export const useLanguageStore = create<State>((set) => {
  const code = getStoredLang()
  const lang = LANGUAGES.find((l) => l.code === code)
  const firstLaunchDone = localStorage.getItem(FIRST_LAUNCH_KEY) === '1'

  return {
    code,
    currentName: lang?.nativeName ?? 'English',
    firstLaunchDone,

    setLanguage: (newCode: string) => {
      localStorage.setItem(LS_KEY, newCode)
      const l = LANGUAGES.find((la) => la.code === newCode)
      i18n.changeLanguage(newCode).catch(() => {})
      set({ code: newCode, currentName: l?.nativeName ?? 'English' })
    },

    markFirstLaunchDone: () => {
      localStorage.setItem(FIRST_LAUNCH_KEY, '1')
      set({ firstLaunchDone: true })
    },
  }
})
