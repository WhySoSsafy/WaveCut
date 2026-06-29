import { describe, it, expect } from "vitest";
import { FALLBACK, BEACH_IDS } from "@/lib/data/fallback";
import { getEnv, getEnvOptional } from "@/lib/api/env";
import { STATIONS } from "@/lib/api/stations";

describe("fallback 데이터", () => {
  it("부산 6개 해변을 가진다", () => {
    expect(BEACH_IDS).toEqual(["haeundae", "gwangalli", "songjeong", "songdo", "dadaepo", "ilgwang"]);
  });
  it("각 해변은 3개 transect를 가진다", () => {
    for (const id of BEACH_IDS) {
      expect(FALLBACK[id].transects).toHaveLength(3);
    }
  });
  it("해운대는 score 86, status safe", () => {
    expect(FALLBACK.haeundae.score).toBe(86);
    expect(FALLBACK.haeundae.status).toBe("safe");
  });
});

describe("FALLBACK/STATIONS 키 일치", () => {
  it("FALLBACK 키가 BEACH_IDS와 정확히 일치", () => {
    expect(Object.keys(FALLBACK).sort()).toEqual([...BEACH_IDS].sort());
  });
  it("STATIONS가 모든 해변 id를 가진다", () => {
    for (const id of BEACH_IDS) expect(STATIONS[id]).toBeDefined();
  });
});

describe("env", () => {
  it("getEnv는 없으면 throw, 있으면 값 반환", () => {
    delete process.env.__WC_TEST__;
    expect(() => getEnv("__WC_TEST__")).toThrow();
    process.env.__WC_TEST__ = "x";
    expect(getEnv("__WC_TEST__")).toBe("x");
    delete process.env.__WC_TEST__;
  });
  it("getEnvOptional은 없으면 undefined", () => {
    expect(getEnvOptional("__WC_MISSING__")).toBeUndefined();
  });
});
