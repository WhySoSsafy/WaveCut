import { describe, it, expect } from "vitest";
import {
  profileFromTransect, profileFromGrid, transectAt, depthAt, analyze,
  type TransectParams,
} from "@/lib/bsm/profile";

const HAEUNDAE_CENTER: TransectParams = { shelf: 42, shelfDepth: 0.75, slope: 0.05, rip: false };

describe("profileFromTransect", () => {
  const bed = profileFromTransect(HAEUNDAE_CENTER);
  it("마른 모래사장(음수 거리)은 음수 깊이", () => {
    expect(bed(-14)).toBeCloseTo(-0.5, 5);
  });
  it("해안선(0m)은 0", () => { expect(bed(0)).toBeCloseTo(0, 5); });
  it("모래턱 끝(42m)은 shelfDepth", () => { expect(bed(42)).toBeCloseTo(0.75, 5); });
  it("모래턱 이후 급경사", () => {
    expect(bed(62)).toBeCloseTo(0.75 + 20 * 0.05, 5); // 1.75
  });
});

describe("profileFromGrid (선형 보간)", () => {
  const bed = profileFromGrid([
    { dist: 0, depth: 0 }, { dist: 20, depth: 1.0 }, { dist: 40, depth: 2.0 },
  ]);
  it("격자점은 정확히 일치", () => { expect(bed(20)).toBeCloseTo(1.0, 5); });
  it("격자 사이는 선형 보간", () => { expect(bed(10)).toBeCloseTo(0.5, 5); });
  it("범위 밖은 가장자리 클램프", () => {
    expect(bed(-5)).toBeCloseTo(0, 5);
    expect(bed(100)).toBeCloseTo(2.0, 5);
  });
});

describe("depthAt (조위 가산)", () => {
  const bed = profileFromTransect(HAEUNDAE_CENTER);
  it("조위 0.35m를 더한다", () => {
    expect(depthAt(bed, 0.35, 0)).toBeCloseTo(0.35, 5);
  });
});

describe("analyze", () => {
  const bed = profileFromTransect({ shelf: 20, shelfDepth: 0.6, slope: 0.2, rip: false });
  it("무릎끝(>0.6)과 위험시작(>=1.5) 거리를 정확히 찾는다", () => {
    const r = analyze(bed, 0);
    expect(r.kneeEnd).toBe(21);        // d=20.5 -> round 21
    expect(r.dangerStart).toBe(25);    // d=24.5 -> round 25
  });
  it("위험 구간이 없으면 dangerStart는 null", () => {
    const flat = profileFromTransect({ shelf: 80, shelfDepth: 0.5, slope: 0.001, rip: false });
    expect(analyze(flat, 0).dangerStart).toBeNull();
  });
});

describe("transectAt (위치 보간)", () => {
  const ts: TransectParams[] = [
    { shelf: 20, shelfDepth: 0.7, slope: 0.06, rip: false },
    { shelf: 40, shelfDepth: 0.8, slope: 0.05, rip: false },
    { shelf: 20, shelfDepth: 0.9, slope: 0.10, rip: true },
  ];
  it("p=0은 첫 transect", () => { expect(transectAt(ts, 0).shelf).toBeCloseTo(20, 5); });
  it("p=1은 마지막 transect", () => { expect(transectAt(ts, 1).shelf).toBeCloseTo(20, 5); });
  it("p=0.25는 0번과 1번 사이 보간", () => {
    expect(transectAt(ts, 0.25).shelf).toBeCloseTo(30, 5); // 20 + (40-20)*0.5
  });
  it("rip은 f>=0.5에서 다음 transect 값으로 넘어간다", () => {
    expect(transectAt(ts, 0.625).rip).toBe(false); // x=1.25, i=1, f=0.25 -> a(ts[1])
    expect(transectAt(ts, 0.875).rip).toBe(true);  // x=1.75, i=1, f=0.75 -> b(ts[2])
  });
  it("shelfDepth/slope도 보간된다", () => {
    const t = transectAt(ts, 0.25); // i=0, f=0.5
    expect(t.shelfDepth).toBeCloseTo(0.75, 5); // (0.7+0.8)/2
    expect(t.slope).toBeCloseTo(0.055, 5);     // (0.06+0.05)/2
  });
});
