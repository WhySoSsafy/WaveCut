import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CrossSection } from "@/components/shared/CrossSection";
import { FALLBACK } from "@/lib/data/fallback";

// BeachDetail 형태로 최소 변환한 fixture
const beach = {
  ...FALLBACK.haeundae, score: 86, status: "safe" as const,
  windSpeed: 3, quality: "적합" as const,
  tideOffsets: { now: 0, t1: 0.35, t2: 0.7 },
  grid: null,
};

describe("CrossSection", () => {
  it("조위 시뮬레이션 탭 3개를 렌더한다", () => {
    render(<CrossSection beach={beach as any} />);
    expect(screen.getByText("현재")).toBeDefined();
    expect(screen.getByText("1시간 후")).toBeDefined();
    expect(screen.getByText("2시간 후")).toBeDefined();
  });
  it("AI 코멘트를 표시한다", () => {
    render(<CrossSection beach={beach as any} />);
    expect(screen.getByText(/단면은 해안선에서 약/)).toBeDefined();
  });
  it("시간대를 바꾸면 코멘트가 갱신된다", () => {
    render(<CrossSection beach={beach as any} />);
    const before = screen.getByText(/단면은 해안선에서 약/).textContent;
    fireEvent.click(screen.getByText("2시간 후"));
    const after = screen.getByText(/단면은 해안선에서 약/).textContent;
    expect(after).not.toEqual(before); // 조위 상승으로 kneeEnd 변화
  });
});
