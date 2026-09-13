import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { dictionary, languageOrder } from "./translations";

export type AppLanguage = (typeof languageOrder)[number];

const languageNames: Record<AppLanguage, string> = {
  fr: "Français",
  en: "English",
  es: "Español",
  de: "Deutsch",
  pt: "Português",
  it: "Italiano",
  ar: "العربية",
};

const rtlLanguages: AppLanguage[] = ["ar"];

type Vars = Record<string, string | number>;

const indexOfLanguage = (language: AppLanguage) => languageOrder.indexOf(language);

function interpolate(text: string, vars?: Vars) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

export function translate(language: AppLanguage, key: string, vars?: Vars): string {
  const entry = dictionary[key];
  if (!entry) return key;
  return interpolate(entry[indexOfLanguage(language)] ?? entry[0], vars);
}

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: string, vars?: Vars) => string;
}

const localeByLanguage: Record<AppLanguage, string> = {
  fr: "fr-FR",
  en: "en-US",
  es: "es-ES",
  de: "de-DE",
  pt: "pt-PT",
  it: "it-IT",
  ar: "ar",
};

let activeLanguage: AppLanguage = "fr";
export const getActiveLanguage = () => activeLanguage;
export const getActiveLocale = () => localeByLanguage[activeLanguage];

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const isLanguage = (value: string | null): value is AppLanguage =>
  !!value && value in languageNames;

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("fr");

  useEffect(() => {
    const saved = window.localStorage.getItem("sooko-language");
    if (isLanguage(saved)) {
      activeLanguage = saved;
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (next: AppLanguage) => {
    activeLanguage = next;
    setLanguageState(next);
    window.localStorage.setItem("sooko-language", next);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = rtlLanguages.includes(language) ? "rtl" : "ltr";
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t: (key, vars) => translate(language, key, vars) }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

const fallbackContext: LanguageContextValue = {
  language: "fr",
  setLanguage: () => {},
  t: (key, vars) => translate("fr", key, vars),
};

export function useLanguage() {
  return useContext(LanguageContext) ?? fallbackContext;
}

export { languageNames };
