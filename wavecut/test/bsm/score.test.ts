import { describe, it, expect } from "vitest";
import { computeScore, statusOf, type ScoreInput } from "@/lib/bsm/score";

const GOOD: ScoreInput = {
  dangerStart: null, rip: "안전", waveHeight: 0.4, tideRising: false, windSpeed: 2, quality: "적합",
};

describe("computeScore", () => {
  it("이상적 조건은 90점 이상", () => {
    expect(computeScore(GOOD)).toBeGreaterThanOrEqual(90);
  });
  it("이안류 위험은 점수를 크게 낮춘다", () => {
    expect(computeScore({ ...GOOD, rip: "위험" })).toBeLessThan(computeScore(GOOD));
  });
  it("파고가 높으면 점수가 낮아진다", () => {
    expect(computeScore({ ...GOOD, waveHeight: 2.0 })).toBeLessThan(computeScore(GOOD));
  });
  it("0~100 범위로 클램프된다", () => {
    const worst: ScoreInput = {
      dangerStart: 5, rip: "위험", waveHeight: 3, tideRising: true, windSpeed: 20, quality: "부적합",
    };
    const s = computeScore(worst);
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(100);
  });
});

describe("statusOf", () => {
  it(">=70 safe", () => expect(statusOf(86)).toBe("safe"));
  it(">=40 caution", () => expect(statusOf(58)).toBe("caution"));
  it("<40 danger", () => expect(statusOf(30)).toBe("danger"));
});
