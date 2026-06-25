import type { BeachId } from "@/lib/data/fallback";
import { getEnv } from "./env";
import { STATIONS } from "./stations";

export interface WeatherResult {
  sky: string;
  air: number;
  uv: string;
  windSpeed: number;
}

interface WeatherItem {
  category: string;
  obsrValue: string;
}

const SKY_MAP: Record<string, string> = {
  "1": "맑음",
  "2": "구름조금",
  "3": "구름많음",
  "4": "흐림",
};

// TODO: confirm real API schema — KMA Ultra-Short-Range API; category names may vary
export function parseWeather(json: unknown): WeatherResult | null {
  const items = (
    json as {
      response?: {
        body?: { items?: { item?: unknown } };
      };
    }
  )?.response?.body?.items?.item;
  if (!Array.isArray(items) || items.length === 0) return null;

  const typedItems = items as WeatherItem[];
  const find = (cat: string): string | undefined =>
    typedItems.find((i) => i.category === cat)?.obsrValue;

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
    const key = getEnv("DATA_GO_KR_KEY");
    // TODO: confirm real API schema — KMA Ultra-Short-Range Forecast endpoint and date/time params
    const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${key}&nx=${st.gridX}&ny=${st.gridY}&dataType=JSON`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return parseWeather(await res.json());
  } catch {
    return null;
  }
}
