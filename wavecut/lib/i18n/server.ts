import { cookies } from "next/headers";
import { LOCALE_COOKIE, DEFAULT_LOCALE, isLocale, type Locale } from "./config";
import { getDictionary, type Dict } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const v = store.get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : DEFAULT_LOCALE;
}

export async function getI18n(): Promise<{ locale: Locale; t: Dict }> {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
}
