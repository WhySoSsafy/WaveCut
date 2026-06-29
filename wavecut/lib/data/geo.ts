import { STATIONS } from "@/lib/api/stations";
import { FALLBACK, BEACH_IDS } from "@/lib/data/fallback";
import type { BeachId } from "@/lib/data/fallback";

export interface NearbyBeach {
  id: BeachId;
  name: string;
  km: number;
}

/** Haversine great-circle distance in km. */
export function haversineKm(
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number
): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** Beaches sorted nearest-first from a given position. */
export function nearestBeaches(lat: number, lon: number): NearbyBeach[] {
  return BEACH_IDS.map((id) => ({
    id,
    name: FALLBACK[id].name,
    km: haversineKm(lat, lon, STATIONS[id].lat, STATIONS[id].lon),
  })).sort((a, b) => a.km - b.km);
}
