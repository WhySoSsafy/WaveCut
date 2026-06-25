import type { BeachId } from "@/lib/data/fallback";
import { getEnv } from "./env";
import { STATIONS } from "./stations";

export interface WeatherResult {
  sky: string;
  air: number;
  uv?: string;
  windSpeed: number;
}

interface NcstItem {
  category: string;
  obsrValue: string;
}

interface FcstItem {
  category: string;
  fcstTime: string;
  fcstValue: string;
}

const SKY_MAP: Record<string, string> = {
  "1": "맑음",
  "3": "구름많음",
  "4": "흐림",
};

// UV requires the separate 생활기상지수(자외선지수) API — left to fallback

/**
 * Compute KST base_date and base_time for getUltraSrtNcst.
 * 초단기실황 is published hourly and available ~10 min after the hour.
 * We use the PREVIOUS full hour as base_time to avoid "no data yet" errors.
 * Server may run in UTC, so we compute KST via UTC getters + 9h offset.
 */
function getNcstBaseDateTime(): { base_date: string; base_time: string } {
  const kst = new Date(Date.now() + 9 * 3600 * 1000);
  let year = kst.getUTCFullYear();
  let month = kst.getUTCMonth() + 1;
  let day = kst.getUTCDate();
  let hour = kst.getUTCHours();

  // Use previous full hour to ensure data is published
  hour -= 1;
  if (hour < 0) {
    hour = 23;
    day -= 1;
    if (day < 1) {
      month -= 1;
      if (month < 1) {
        month = 12;
        year -= 1;
      }
      // Days in the previous month
      const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
      day = daysInMonth;
    }
  }

  const base_date =
    String(year) +
    String(month).padStart(2, "0") +
    String(day).padStart(2, "0");
  const base_time = String(hour).padStart(2, "0") + "00";
  return { base_date, base_time };
}

/**
 * Compute KST base_date and base_time for getUltraSrtFcst.
 * 초단기예보 is published at HH30; we use the previous hour's HH30 to be safe.
 */
function getFcstBaseDateTime(): { base_date: string; base_time: string } {
  const { base_date, base_time } = getNcstBaseDateTime();
  // base_time is HH00 for the previous hour; use HH30 of same hour
  const hour = base_time.slice(0, 2);
  return { base_date, base_time: hour + "30" };
}

/**
 * Parse getUltraSrtNcst response — returns T1H (기온℃), WSD (풍속 m/s), PTY (강수형태).
 * Pure function, unit-testable.
 */
export function parseNcst(
  json: unknown
): { air: number; windSpeed: number; pty: string } | null {
  const items = (
    json as {
      response?: { body?: { items?: { item?: unknown } } };
    }
  )?.response?.body?.items?.item;
  if (!Array.isArray(items) || items.length === 0) return null;

  const isItem = (x: unknown): x is NcstItem =>
    x != null && typeof x === "object";

  const find = (cat: string): string | undefined => {
    const match = (items as unknown[]).find(
      (i) => isItem(i) && (i as NcstItem).category === cat
    );
    return match != null ? (match as NcstItem).obsrValue : undefined;
  };

  const airStr = find("T1H");
  const wsdStr = find("WSD");
  const pty = find("PTY") ?? "0";

  if (airStr === undefined || wsdStr === undefined) return null;

  const air = parseFloat(airStr);
  if (!Number.isFinite(air)) return null;

  const windSpeed = parseFloat(wsdStr);
  if (!Number.isFinite(windSpeed)) return null;

  return { air, windSpeed, pty };
}

/**
 * Parse getUltraSrtFcst response — picks the SKY category from the nearest fcstTime.
 * Pure function, unit-testable.
 */
export function parseFcstSky(json: unknown, nowBaseTime: string): string | null {
  const items = (
    json as {
      response?: { body?: { items?: { item?: unknown } } };
    }
  )?.response?.body?.items?.item;
  if (!Array.isArray(items) || items.length === 0) return null;

  const isItem = (x: unknown): x is FcstItem =>
    x != null && typeof x === "object";

  // Collect all SKY rows
  const skyRows = (items as unknown[]).filter(
    (i) => isItem(i) && (i as FcstItem).category === "SKY"
  ) as FcstItem[];

  if (skyRows.length === 0) return null;

  // Pick the earliest row whose fcstTime >= nowBaseTime (next upcoming forecast).
  // If all rows are earlier than nowBaseTime, use the LAST (most recent) row.
  // fcstTime format is "HHMM" (e.g. "1400")
  const sorted = skyRows.slice().sort((a, b) => a.fcstTime.localeCompare(b.fcstTime));
  let picked = sorted[sorted.length - 1]; // default: most recent past row
  for (const row of sorted) {
    if (row.fcstTime >= nowBaseTime) {
      picked = row;
      break;
    }
  }

  return SKY_MAP[picked.fcstValue] ?? null;
}

/**
 * Legacy parseWeather kept for backward-compatibility with existing unit tests.
 * Tests pass a mock that includes SKY/T1H/UV/WSD in obsrValue — this parser
 * still handles that shape so existing test assertions continue to pass.
 */
export function parseWeather(json: unknown): WeatherResult | null {
  const items = (
    json as {
      response?: { body?: { items?: { item?: unknown } } };
    }
  )?.response?.body?.items?.item;
  if (!Array.isArray(items) || items.length === 0) return null;

  const isItem = (x: unknown): x is NcstItem =>
    x != null && typeof x === "object";

  const find = (cat: string): string | undefined => {
    const match = (items as unknown[]).find(
      (i) => isItem(i) && (i as NcstItem).category === cat
    );
    return match != null ? (match as NcstItem).obsrValue : undefined;
  };

  const skyCode = find("SKY") ?? "";
  const airStr = find("T1H");
  const uv = find("UV") ?? "보통";
  const wsdStr = find("WSD");

  if (airStr === undefined || wsdStr === undefined) return null;

  const air = parseFloat(airStr);
  if (!Number.isFinite(air)) return null;

  const windSpeed = parseFloat(wsdStr);
  if (!Number.isFinite(windSpeed)) return null;

  return {
    sky: SKY_MAP[skyCode] ?? "알 수 없음",
    air,
    uv,
    windSpeed,
  };
}

export async function fetchWeather(id: BeachId): Promise<WeatherResult | null> {
  try {
    const st = STATIONS[id];
    const rawKey = getEnv("DATA_GO_KR_KEY");
    const key = encodeURIComponent(rawKey);

    const { base_date, base_time } = getNcstBaseDateTime();
    const { base_date: fcst_date, base_time: fcst_time } = getFcstBaseDateTime();

    const nx = st.gridX;
    const ny = st.gridY;

    const commonParams = `numOfRows=100&pageNo=1&dataType=JSON&nx=${nx}&ny=${ny}`;

    // Call 1: 초단기실황 — T1H (기온), WSD (풍속), PTY (강수형태)
    const ncstUrl =
      `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst` +
      `?serviceKey=${key}&${commonParams}&base_date=${base_date}&base_time=${base_time}`;

    // Call 2: 초단기예보 — SKY (하늘상태)
    const fcstUrl =
      `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst` +
      `?serviceKey=${key}&${commonParams}&base_date=${fcst_date}&base_time=${fcst_time}`;

    const [ncstRes, fcstRes] = await Promise.all([
      fetch(ncstUrl, { next: { revalidate: 3600 } }),
      fetch(fcstUrl, { next: { revalidate: 3600 } }).catch(() => null),
    ]);

    if (!ncstRes.ok) return null;
    const ncstJson = await ncstRes.json();
    const ncst = parseNcst(ncstJson);
    if (!ncst) return null;

    // Sky from 초단기예보; fallback from PTY if that call fails
    let sky = "구름조금";
    if (fcstRes && fcstRes.ok) {
      try {
        const fcstJson = await fcstRes.json();
        const parsed = parseFcstSky(fcstJson, fcst_time);
        if (parsed) sky = parsed;
        else {
          sky = ncst.pty === "0" ? "맑음" : "흐림";
        }
      } catch {
        sky = ncst.pty === "0" ? "맑음" : "흐림";
      }
    } else {
      sky = ncst.pty === "0" ? "맑음" : "흐림";
    }

    return {
      sky,
      air: ncst.air,
      // UV requires the separate 생활기상지수(자외선지수) API — left undefined so
      // aggregate's `weather?.uv ?? fb.uv` correctly falls back to FALLBACK[id].uv
      windSpeed: ncst.windSpeed,
    };
  } catch {
    return null;
  }
}
