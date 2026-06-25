export interface TransectParams { shelf: number; shelfDepth: number; slope: number; rip: boolean }
export interface GridSample { dist: number; depth: number }
export type BedProfile = (dist: number) => number;
export interface AnalyzeResult { kneeEnd: number; dangerStart: number | null }

// data.js bedDepth 이식: 거리 d(m, 음수=마른 모래사장)의 조위0 깊이
export function profileFromTransect(t: TransectParams): BedProfile {
  return (d: number) => {
    if (d < 0) return (d / 14) * 0.5;
    if (d <= t.shelf) return (d / t.shelf) * t.shelfDepth;
    return t.shelfDepth + (d - t.shelf) * t.slope;
  };
}

// 실데이터 격자: dist 오름차순 samples를 선형 보간, 범위 밖은 가장자리 클램프
export function profileFromGrid(samples: GridSample[]): BedProfile {
  const sorted = [...samples].sort((a, b) => a.dist - b.dist);
  return (d: number) => {
    if (d <= sorted[0].dist) return sorted[0].depth;
    const last = sorted[sorted.length - 1];
    if (d >= last.dist) return last.depth;
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i], b = sorted[i + 1];
      if (d >= a.dist && d <= b.dist) {
        const f = (d - a.dist) / (b.dist - a.dist);
        return a.depth + (b.depth - a.depth) * f;
      }
    }
    return last.depth;
  };
}

export function lerpTransect(a: TransectParams, b: TransectParams, f: number): TransectParams {
  return {
    shelf: a.shelf + (b.shelf - a.shelf) * f,
    shelfDepth: a.shelfDepth + (b.shelfDepth - a.shelfDepth) * f,
    slope: a.slope + (b.slope - a.slope) * f,
    rip: f < 0.5 ? a.rip : b.rip,
  };
}

export function transectAt(transects: TransectParams[], p: number): TransectParams {
  const x = p * (transects.length - 1);
  const i = Math.min(Math.floor(x), transects.length - 2);
  return lerpTransect(transects[i], transects[i + 1], x - i);
}

export function depthAt(profile: BedProfile, tideOffset: number, dist: number): number {
  return profile(dist) + tideOffset;
}

// data.js analyze 이식: 해안선에서 무릎끝(>0.6)·위험시작(>=1.5) 거리
export function analyze(profile: BedProfile, tideOffset: number): AnalyzeResult {
  let kneeEnd: number | null = null;
  let dangerStart: number | null = null;
  for (let d = 0; d <= 80; d += 0.5) {
    const dep = depthAt(profile, tideOffset, d);
    if (kneeEnd === null && dep > 0.6) kneeEnd = d;
    if (dangerStart === null && dep >= 1.5) { dangerStart = d; break; }
  }
  return {
    kneeEnd: kneeEnd === null ? 80 : Math.round(kneeEnd),
    dangerStart: dangerStart === null ? null : Math.round(dangerStart),
  };
}
