import { describe, it, expect } from "vitest";
import { FALLBACK, BEACH_IDS } from "@/lib/data/fallback";

describe("fallback 데이터", () => {
  it("부산 5개 해변을 가진다", () => {
    expect(BEACH_IDS).toEqual(["haeundae", "gwangalli", "songjeong", "songdo", "dadaepo"]);
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
