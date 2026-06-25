import { describe, it, expect } from "vitest";
import { positionName, aiComment, situationTips } from "@/lib/bsm/aiComment";

describe("positionName", () => {
  it("p<0.34는 좌측", () => expect(positionName(0.2)).toBe("좌측"));
  it("0.34~0.67는 중앙", () => expect(positionName(0.5)).toBe("중앙"));
  it("p>=0.67는 우측", () => expect(positionName(0.8)).toBe("우측"));
});

describe("aiComment", () => {
  it("위험 구간이 있으면 급경사 주의 문구 포함", () => {
    const text = aiComment({ kneeEnd: 30, dangerStart: 45 }, 0.5);
    expect(text).toContain("중앙");
    expect(text).toContain("30m");
    expect(text).toContain("45m");
    expect(text).toContain("주의");
  });
  it("위험 구간이 없으면 급격한 변화 없음 문구", () => {
    const text = aiComment({ kneeEnd: 80, dangerStart: null }, 0.5);
    expect(text).toContain("급격한 수심 변화는 확인되지 않습니다");
  });
});

describe("situationTips", () => {
  it("4개 카드를 반환한다", () => {
    const tips = situationTips({ kneeEnd: 30, dangerStart: 45 }, { family: true, crowd: "보통" });
    expect(tips).toHaveLength(4);
    expect(tips.map((t) => t.key)).toEqual(["family", "begin", "after", "crowd"]);
  });
  it("혼잡도가 많으면 혼잡 카드가 caution", () => {
    const tips = situationTips({ kneeEnd: 30, dangerStart: null }, { family: true, crowd: "많음" });
    expect(tips.find((t) => t.key === "crowd")!.status).toBe("caution");
  });
  it("family 카드 status는 opts.family에 따른다", () => {
    const yes = situationTips({ kneeEnd: 30, dangerStart: null }, { family: true, crowd: "보통" });
    const no = situationTips({ kneeEnd: 30, dangerStart: null }, { family: false, crowd: "보통" });
    expect(yes.find((t) => t.key === "family")!.status).toBe("safe");
    expect(no.find((t) => t.key === "family")!.status).toBe("caution");
  });
  it("begin 카드는 위험구간 유무에 따라 status가 바뀐다", () => {
    const withDanger = situationTips({ kneeEnd: 30, dangerStart: 45 }, { family: true, crowd: "보통" });
    const noDanger = situationTips({ kneeEnd: 30, dangerStart: null }, { family: true, crowd: "보통" });
    expect(withDanger.find((t) => t.key === "begin")!.status).toBe("caution");
    expect(noDanger.find((t) => t.key === "begin")!.status).toBe("safe");
  });
  it("after 카드는 항상 caution, crowd는 여유 시 safe", () => {
    const tips = situationTips({ kneeEnd: 30, dangerStart: null }, { family: true, crowd: "여유" });
    expect(tips.find((t) => t.key === "after")!.status).toBe("caution");
    expect(tips.find((t) => t.key === "crowd")!.status).toBe("safe");
  });
});
