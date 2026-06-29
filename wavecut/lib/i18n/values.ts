import type { Dict } from "./dictionaries";

type ValueKind = keyof Dict["common"]["values"];

/**
 * Translate a Korean data value (e.g. sky "맑음", uv "높음", crowd "여유")
 * via the locale's value map. Falls back to the original value when unmapped.
 */
export function tv(t: Dict, kind: ValueKind, value: string): string {
  const map = t.common.values[kind] as Record<string, string>;
  return map[value] ?? value;
}
