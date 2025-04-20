import { useCallback } from "react";
import * as Localization from "expo-localization";
import { atom, useAtom, createStore } from "jotai";
import i18n from "../translations/i18n";

// Create a store for accessing atom values outside of React components
const jotaiStore = createStore();

// Get device locale using non-deprecated method
const getDeviceLocale = (): string => {
  const locales = Localization.getLocales();
  return locales && locales.length > 0 && locales[0].languageCode ? locales[0].languageCode : "en";
};

// Create an atom to store the current locale
const localeAtom = atom<string>(getDeviceLocale());

// Define the return type for our hook
type UseTranslationType = {
  t: (scope: string, options?: Record<string, any>) => string;
  locale: string;
  setLocale: (locale: string) => void;
  isRTL: boolean;
};

export const useTranslation = (): UseTranslationType => {
  const [locale, setLocale] = useAtom(localeAtom);

  // Update i18n instance when locale changes
  const handleSetLocale = useCallback(
    (newLocale: string) => {
      i18n.locale = newLocale;
      setLocale(newLocale);
    },
    [setLocale],
  );

  // Translation function
  const t = useCallback((scope: string, options?: Record<string, any>) => {
    return i18n.t(scope, options);
  }, []);

  // Check if the current locale is RTL
  const isRTL = Localization.isRTL;

  return {
    t,
    locale,
    setLocale: handleSetLocale,
    isRTL,
  };
};

// Export a function to get translations outside of React components
export const getTranslation = (scope: string, options?: Record<string, any>): string => {
  // Initialize the atom in the store
  jotaiStore.set(localeAtom, getDeviceLocale());
  const currentLocale = jotaiStore.get(localeAtom);
  i18n.locale = currentLocale;
  return i18n.t(scope, options);
};
