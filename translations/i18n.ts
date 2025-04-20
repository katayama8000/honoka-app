import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import { translations } from './languages';

// Helper function to get the device locale using non-deprecated method
const getDeviceLocale = (): string => {
  const locales = Localization.getLocales();
  return locales && locales.length > 0 ? locales[0].languageCode ?? 'en' : 'en';
};

// Create the i18n instance
const i18n = new I18n(translations);

// Set the locale once at the beginning of your app
i18n.locale = getDeviceLocale();

// When a value is missing from a translation, fallback to another language
i18n.enableFallback = true;

// Set the default locale as fallback
i18n.defaultLocale = 'en';

export default i18n;
