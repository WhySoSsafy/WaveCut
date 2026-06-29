import type { Locale } from "../config";
import { ko, type Dict } from "./ko";
import { en } from "./en";
import { ja } from "./ja";
import { zh } from "./zh";
import { es } from "./es";

const DICTS: Record<Locale, Dict> = { ko, en, ja, zh, es };

export function getDictionary(locale: Locale): Dict {
  return DICTS[locale] ?? ko;
}

export type { Dict };
