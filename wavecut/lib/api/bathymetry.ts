import type { BeachId } from "@/lib/data/fallback";
import type { GridSample } from "@/lib/bsm/profile";
import { STATIONS } from "./stations";
import { getEnvOptional } from "./env";

export interface BathymetryResult {
  left: GridSample[];
  center: GridSample[];
  right: GridSample[];
}

interface RawSection {
  dist: number;
  depth: number;
}

interface RawBathymetry {
  sections?: {
    left?: unknown;
    center?: unknown;
    right?: unknown;
  };
}

// TODO: confirm real API schema — bathymetry grid format from national scientific data pending
export function parseBathymetry(json: unknown): BathymetryResult | null {
  const sections = (json as RawBathymetry)?.sections;
  if (!sections) return null;

  if (!Array.isArray(sections.left)) return null;
  if (!Array.isArray(sections.center)) return null;
  if (!Array.isArray(sections.right)) return null;

  const isValidSample = (x: unknown): x is RawSection =>
    x != null &&
    typeof x === "object" &&
    Number.isFinite((x as RawSection).dist) &&
    Number.isFinite((x as RawSection).depth);

  const toSamples = (arr: unknown[]): GridSample[] | null => {
    const result: GridSample[] = [];
    for (const s of arr) {
      if (!isValidSample(s)) return null;
      result.push({ dist: s.dist, depth: s.depth });
    }
    return result;
  };

  const left = toSamples(sections.left as unknown[]);
  if (left === null || left.length === 0) return null;
  const center = toSamples(sections.center as unknown[]);
  if (center === null || center.length === 0) return null;
  const right = toSamples(sections.right as unknown[]);
  if (right === null || right.length === 0) return null;

  return { left, center, right };
}

export async function fetchBathymetry(id: BeachId): Promise<BathymetryResult | null> {
  try {
    const st = STATIONS[id];
    const key = getEnvOptional("BATHYMETRY_API_KEY") ?? "";
    // TODO: confirm real API schema — marine scientific data portal; URL and params TBD
    const url = `https://api.khoa.go.kr/bathymetry/grid?siteCode=${st.tideObsCode}&type=json&ServiceKey=${key}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return parseBathymetry(await res.json());
  } catch {
    return null;
  }
}
