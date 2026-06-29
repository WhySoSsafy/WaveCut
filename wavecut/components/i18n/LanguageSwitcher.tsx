"use client";

import { useRouter } from "next/navigation";
import {
  LOCALES,
  LOCALE_NAMES,
  LOCALE_COOKIE,
} from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import styles from "./languageSwitcher.module.css";

export function LanguageSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const current = useLocale();

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const loc = e.target.value;
    document.cookie = `${LOCALE_COOKIE}=${loc}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };

  return (
    <label className={`${styles.wrap}${className ? ` ${className}` : ""}`}>
      <span className={styles.globe} aria-hidden="true">
        🌐
      </span>
      <select
        className={styles.select}
        value={current}
        onChange={onChange}
        aria-label="Language"
      >
        {LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {LOCALE_NAMES[loc]}
          </option>
        ))}
      </select>
    </label>
  );
}
