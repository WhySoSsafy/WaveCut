import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/tide", () => ({ fetchTide: vi.fn() }));
vi.mock("@/lib/api/weather", () => ({ fetchWeather: vi.fn() }));
vi.mock("@/lib/api/beachInfo", () => ({ fetchBeachInfo: vi.fn() }));
vi.mock("@/lib/api/rip", () => ({ fetchRip: vi.fn() }));
vi.mock("@/lib/api/wave", () => ({ fetchWave: vi.fn() }));
vi.mock("@/lib/api/quality", () => ({ fetchQuality: vi.fn() }));
vi.mock("@/lib/api/bathymetry", () => ({ fetchBathymetry: vi.fn() }));

import { fetchTide } from "@/lib/api/tide";
import { fetchWeather } from "@/lib/api/weather";
import { getBeachSummary, getBeachDetail } from "@/lib/api/aggregate";

beforeEach(() => vi.clearAllMocks());

describe("getBeachSummary", () => {
  it("API 전부 실패해도 fallback으로 채운다", async () => {
    (fetchTide as any).mockResolvedValue(null);
    (fetchWeather as any).mockResolvedValue(null);
    const s = await getBeachSummary("haeundae");
    expect(s.id).toBe("haeundae");
    expect(s.name).toBe("해운대 해수욕장");
    expect(["safe", "caution", "danger"]).toContain(s.status);
    // 정보 위계: summary에는 wave/tide/rip이 없어야 한다
    expect((s as any).wave).toBeUndefined();
    expect((s as any).rip).toBeUndefined();
  });
  it("날씨 API 성공 시 실데이터로 덮어쓴다", async () => {
    (fetchWeather as any).mockResolvedValue({ sky: "비", air: 19, uv: "보통", windSpeed: 4 });
    const s = await getBeachSummary("haeundae");
    expect(s.sky).toBe("비");
    expect(s.air).toBe(19);
  });
});

describe("getBeachSummary resilience", () => {
  it("fetcher가 reject해도 fallback으로 복구한다", async () => {
    (fetchTide as any).mockRejectedValue(new Error("network"));
    (fetchWeather as any).mockResolvedValue(null);
    const s = await getBeachSummary("haeundae");
    expect(s.id).toBe("haeundae");
    expect(["safe","caution","danger"]).toContain(s.status);
  });
});

describe("getBeachDetail", () => {
  it("상세는 전문 정보를 포함한다", async () => {
    (fetchTide as any).mockResolvedValue({ nowOffset: 0, t1Offset: 0.35, t2Offset: 0.7, rising: true, label: "중조" });
    const d = await getBeachDetail("haeundae");
    expect(d.wave).toBeGreaterThanOrEqual(0);
    expect(d.tideOffsets.t2).toBeCloseTo(0.7, 2);
    expect(d.transects).toHaveLength(3);
  });
});
