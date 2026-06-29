export const LOCALES = ["ko", "en", "ja", "zh", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ko";
export const LOCALE_COOKIE = "wc_locale";

export const LOCALE_NAMES: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  zh: "中文",
  es: "Español",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  ko: "한",
  en: "EN",
  ja: "日",
  zh: "中",
  es: "ES",
};

export function isLocale(v: string | undefined): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}
