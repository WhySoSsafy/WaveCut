"use client";

import { createContext, useContext } from "react";
import type { Locale } from "./config";
import { ko, type Dict } from "./dictionaries/ko";

const Ctx = createContext<{ locale: Locale; t: Dict }>({ locale: "ko", t: ko });

export function LocaleProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dict;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={{ locale, t: dict }}>{children}</Ctx.Provider>;
}

/** Translations for the current locale (client components). */
export function useT(): Dict {
  return useContext(Ctx).t;
}

export function useLocale(): Locale {
  return useContext(Ctx).locale;
}
