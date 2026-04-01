import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ua from './locales/ua.json';
import en from './locales/en.json';
import ru from './locales/ru.json';
import ja from './locales/ja.json';
import fi from './locales/fi.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ua: { translation: ua },
      en: { translation: en },
      ru: { translation: ru },
      ja: { translation: ja },
      fi: { translation: fi },
    },
    lng: 'ua',
    fallbackLng: 'ua',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'finflow_language',
    },
  });

export default i18n;
