import { describe, it, expect } from "vitest";
import { parseTide } from "@/lib/api/tide";
import { parseRip } from "@/lib/api/rip";
import { parseQuality } from "@/lib/api/quality";
import { parseWeather } from "@/lib/api/weather";
import { parseBeachInfo } from "@/lib/api/beachInfo";
import { parseWave } from "@/lib/api/wave";
import { parseBathymetry } from "@/lib/api/bathymetry";

describe("parseTide", () => {
  it("관측 조위에서 now/t1/t2 오프셋을 계산한다", () => {
    const json = {
      result: {
        data: [
          { record_time: "2026-06-25 14:00:00", tide_level: "120" },
          { record_time: "2026-06-25 15:00:00", tide_level: "155" },
          { record_time: "2026-06-25 16:00:00", tide_level: "190" },
        ],
      },
    };
    const r = parseTide(json, "2026-06-25 14:00:00");
    expect(r).not.toBeNull();
    expect(r!.nowOffset).toBeCloseTo(0, 2);
    expect(r!.t1Offset).toBeCloseTo(0.35, 2);
    expect(r!.t2Offset).toBeCloseTo(0.70, 2);
    expect(r!.rising).toBe(true);
  });

  it("데이터가 없으면 null", () => {
    expect(parseTide({ result: { data: [] } }, "2026-06-25 14:00:00")).toBeNull();
  });

  it("하강 조위는 rising=false", () => {
    const json = {
      result: {
        data: [
          { record_time: "2026-06-25 14:00:00", tide_level: "200" },
          { record_time: "2026-06-25 15:00:00", tide_level: "160" },
          { record_time: "2026-06-25 16:00:00", tide_level: "120" },
        ],
      },
    };
    const r = parseTide(json, "2026-06-25 14:00:00");
    expect(r).not.toBeNull();
    expect(r!.rising).toBe(false);
    expect(r!.t1Offset).toBeCloseTo(-0.40, 2);
    expect(r!.t2Offset).toBeCloseTo(-0.80, 2);
  });

  it("result 또는 data가 없으면 null", () => {
    expect(parseTide({}, "2026-06-25 14:00:00")).toBeNull();
    expect(parseTide({ result: {} }, "2026-06-25 14:00:00")).toBeNull();
  });

  it("data가 배열이 아니면 null (string)", () => {
    expect(parseTide({ result: { data: "oops" } }, "2026-06-25 14:00:00")).toBeNull();
  });

  it("nowCm이 NaN이면 null (tide_level이 숫자 아닌 문자열)", () => {
    const json = {
      result: {
        data: [
          { record_time: "2026-06-25 14:00:00", tide_level: "abc" },
          { record_time: "2026-06-25 15:00:00", tide_level: "155" },
        ],
      },
    };
    expect(parseTide(json, "2026-06-25 99:00:00")).toBeNull();
  });
});

describe("parseRip", () => {
  it("이안류 지수를 단계로 매핑", () => {
    expect(
      parseRip({ response: { body: { items: { item: [{ rip_index: "3" }] } } } })!.level
    ).toBe("위험");
  });

  it("인덱스 0→관심, 1→주의, 2→경계, 3→위험", () => {
    const levels = ["관심", "주의", "경계", "위험"] as const;
    for (let i = 0; i <= 3; i++) {
      expect(
        parseRip({ response: { body: { items: { item: [{ rip_index: String(i) }] } } } })!.level
      ).toBe(levels[i]);
    }
  });

  it("인덱스가 범위를 벗어나면 클램프", () => {
    // 음수 → 관심
    expect(
      parseRip({ response: { body: { items: { item: [{ rip_index: "-5" }] } } } })!.level
    ).toBe("관심");
    // 초과 → 위험
    expect(
      parseRip({ response: { body: { items: { item: [{ rip_index: "99" }] } } } })!.level
    ).toBe("위험");
  });

  it("item이 없으면 null", () => {
    expect(parseRip({ response: { body: { items: { item: [] } } } })).toBeNull();
    expect(parseRip({})).toBeNull();
  });

  it("rip_index가 'abc'이면 null", () => {
    expect(parseRip({ response: { body: { items: { item: [{ rip_index: "abc" }] } } } })).toBeNull();
  });

  it("rip_index 필드가 없으면 null", () => {
    expect(parseRip({ response: { body: { items: { item: [{}] } } } })).toBeNull();
  });
});

describe("parseQuality", () => {
  it("수질 평가 등급을 매핑 - 적합", () => {
    expect(parseQuality({ items: [{ grade: "적합" }] })!.grade).toBe("적합");
  });

  it("수질 평가 등급을 매핑 - 주의", () => {
    expect(parseQuality({ items: [{ grade: "주의" }] })!.grade).toBe("주의");
  });

  it("수질 평가 등급을 매핑 - 부적합", () => {
    expect(parseQuality({ items: [{ grade: "부적합" }] })!.grade).toBe("부적합");
  });

  it("알 수 없는 등급은 주의로 폴백", () => {
    expect(parseQuality({ items: [{ grade: "unknown" }] })!.grade).toBe("주의");
  });

  it("items가 없으면 null", () => {
    expect(parseQuality({})).toBeNull();
    expect(parseQuality({ items: [] })).toBeNull();
  });

  it("items가 배열이 아니면 null", () => {
    expect(parseQuality({ items: "not-array" })).toBeNull();
  });
});

describe("parseWeather", () => {
  it("날씨 정보를 파싱한다", () => {
    const json = {
      response: {
        body: {
          items: {
            item: [
              { category: "SKY", obsrValue: "1" },
              { category: "T1H", obsrValue: "28" },
              { category: "UV", obsrValue: "높음" },
              { category: "WSD", obsrValue: "3.5" },
            ],
          },
        },
      },
    };
    const r = parseWeather(json);
    expect(r).not.toBeNull();
    expect(r!.sky).toBe("맑음");
    expect(r!.air).toBeCloseTo(28, 2);
    expect(r!.uv).toBe("높음");
    expect(r!.windSpeed).toBeCloseTo(3.5, 2);
  });

  it("item이 없으면 null", () => {
    expect(parseWeather({})).toBeNull();
    expect(parseWeather({ response: { body: { items: { item: [] } } } })).toBeNull();
  });

  it("items가 배열이 아니면 null", () => {
    expect(parseWeather({ response: { body: { items: { item: "bad" } } } })).toBeNull();
  });

  it("air(T1H)이 NaN이면 null", () => {
    const json = {
      response: { body: { items: { item: [
        { category: "T1H", obsrValue: "not-a-number" },
        { category: "WSD", obsrValue: "3.5" },
      ] } } },
    };
    expect(parseWeather(json)).toBeNull();
  });

  it("windSpeed(WSD)가 NaN이면 null", () => {
    const json = {
      response: { body: { items: { item: [
        { category: "T1H", obsrValue: "28" },
        { category: "WSD", obsrValue: "not-a-number" },
      ] } } },
    };
    expect(parseWeather(json)).toBeNull();
  });
});

describe("parseBeachInfo", () => {
  it("해수욕장 정보를 파싱한다", () => {
    const json = {
      response: {
        body: {
          items: {
            item: [
              {
                waveHeight: "0.8",
                waterTemp: "23.5",
                windSpeed: "4.2",
                windDir: "북동",
              },
            ],
          },
        },
      },
    };
    const r = parseBeachInfo(json);
    expect(r).not.toBeNull();
    expect(r!.waveHeight).toBeCloseTo(0.8, 2);
    expect(r!.water).toBeCloseTo(23.5, 2);
    expect(r!.windSpeed).toBeCloseTo(4.2, 2);
    expect(r!.windDir).toBe("북동");
  });

  it("item이 없으면 null", () => {
    expect(parseBeachInfo({})).toBeNull();
  });

  it("items가 배열이 아니면 null", () => {
    expect(parseBeachInfo({ response: { body: { items: { item: "bad" } } } })).toBeNull();
  });

  it("waveHeight가 NaN이면 null", () => {
    const json = { response: { body: { items: { item: [
      { waveHeight: "x", waterTemp: "23", windSpeed: "4", windDir: "북" }
    ] } } } };
    expect(parseBeachInfo(json)).toBeNull();
  });

  it("water(waterTemp)가 NaN이면 null", () => {
    const json = { response: { body: { items: { item: [
      { waveHeight: "0.8", waterTemp: "x", windSpeed: "4", windDir: "북" }
    ] } } } };
    expect(parseBeachInfo(json)).toBeNull();
  });

  it("windSpeed가 NaN이면 null", () => {
    const json = { response: { body: { items: { item: [
      { waveHeight: "0.8", waterTemp: "23", windSpeed: "x", windDir: "북" }
    ] } } } };
    expect(parseBeachInfo(json)).toBeNull();
  });
});

describe("parseWave", () => {
  it("파랑 정보를 파싱한다", () => {
    const json = {
      result: {
        data: [
          { wave_height: "1.2", wave_dir: "북동", wave_period: "6.5" },
        ],
      },
    };
    const r = parseWave(json);
    expect(r).not.toBeNull();
    expect(r!.height).toBeCloseTo(1.2, 2);
    expect(r!.dir).toBe("북동");
    expect(r!.period).toBeCloseTo(6.5, 2);
  });

  it("데이터가 없으면 null", () => {
    expect(parseWave({ result: { data: [] } })).toBeNull();
    expect(parseWave({})).toBeNull();
  });

  it("data가 배열이 아니면 null", () => {
    expect(parseWave({ result: { data: "bad" } })).toBeNull();
  });

  it("height가 NaN이면 null", () => {
    expect(parseWave({ result: { data: [{ wave_height: "x", wave_dir: "북", wave_period: "6" }] } })).toBeNull();
  });

  it("period가 NaN이면 null", () => {
    expect(parseWave({ result: { data: [{ wave_height: "1.2", wave_dir: "북", wave_period: "y" }] } })).toBeNull();
  });
});

describe("parseBathymetry", () => {
  it("수심 격자 데이터를 좌/중/우 단면으로 파싱한다", () => {
    const json = {
      sections: {
        left: [
          { dist: 0, depth: 0 },
          { dist: 10, depth: 0.5 },
        ],
        center: [
          { dist: 0, depth: 0 },
          { dist: 20, depth: 1.0 },
        ],
        right: [
          { dist: 0, depth: 0 },
          { dist: 15, depth: 0.8 },
        ],
      },
    };
    const r = parseBathymetry(json);
    expect(r).not.toBeNull();
    expect(r!.left).toHaveLength(2);
    expect(r!.center).toHaveLength(2);
    expect(r!.right).toHaveLength(2);
    expect(r!.left[1].depth).toBeCloseTo(0.5, 2);
    expect(r!.center[1].depth).toBeCloseTo(1.0, 2);
  });

  it("sections가 없으면 null", () => {
    expect(parseBathymetry({})).toBeNull();
  });

  it("sections.left가 배열이 아니면 null", () => {
    const json = {
      sections: {
        left: "bad",
        center: [{ dist: 0, depth: 0 }],
        right: [{ dist: 0, depth: 0 }],
      },
    };
    expect(parseBathymetry(json)).toBeNull();
  });

  it("sections.center가 배열이 아니면 null", () => {
    const json = {
      sections: {
        left: [{ dist: 0, depth: 0 }],
        center: null,
        right: [{ dist: 0, depth: 0 }],
      },
    };
    expect(parseBathymetry(json)).toBeNull();
  });

  it("sections.right가 없으면 null", () => {
    const json = {
      sections: {
        left: [{ dist: 0, depth: 0 }],
        center: [{ dist: 0, depth: 0 }],
      },
    };
    expect(parseBathymetry(json)).toBeNull();
  });
});
