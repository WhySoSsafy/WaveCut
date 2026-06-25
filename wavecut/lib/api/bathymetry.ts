import type { BeachId } from "@/lib/data/fallback";
import type { GridSample } from "@/lib/bsm/profile";

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
    left?: RawSection[];
    center?: RawSection[];
    right?: RawSection[];
  };
}

// TODO: confirm real API schema — bathymetry grid format from national scientific data pending
export function parseBathymetry(json: unknown): BathymetryResult | null {
  const sections = (json as RawBathymetry)?.sections;
  if (!sections) return null;

  const toSamples = (arr: RawSection[] | undefined): GridSample[] =>
    (arr ?? []).map((s) => ({ dist: s.dist, depth: s.depth }));

  const left = toSamples(sections.left);
  const center = toSamples(sections.center);
  const right = toSamples(sections.right);

  if (left.length === 0 && center.length === 0 && right.length === 0) return null;

  return { left, center, right };
}

export async function fetchBathymetry(id: BeachId): Promise<BathymetryResult | null> {
  try {
    // TODO: confirm real API schema — marine scientific data portal; URL and params TBD
    // Real data acquisition is not yet finalized; fallback transects used upstream when null
    void id; // id will be used once real endpoint is confirmed
    return null;
  } catch {
    return null;
  }
}
