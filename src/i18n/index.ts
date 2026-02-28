import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import it from './locales/it.json'

const LS_KEY = 'apex-language'

function getSavedLang(): string {
  try { return localStorage.getItem(LS_KEY) || 'en' } catch { return 'en' }
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, es: { translation: es }, fr: { translation: fr }, de: { translation: de }, it: { translation: it } },
  lng: getSavedLang(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
