import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BeachCard } from "@/components/shared/BeachCard";

const summary = {
  id: "haeundae", name: "해운대 해수욕장", region: "부산 해운대구",
  status: "safe" as const, score: 86, sky: "맑음", air: 27, uv: "높음", crowd: "보통",
};

describe("BeachCard (정보 위계)", () => {
  it("쉬운 정보(날씨/자외선/혼잡)를 노출한다", () => {
    render(<BeachCard beach={summary} href="/beach/haeundae" />);
    expect(screen.getByText("해운대 해수욕장")).toBeDefined();
    expect(screen.getByText(/맑음/)).toBeDefined();
  });
  it("전문 정보(파고/조위/이안류)를 노출하지 않는다", () => {
    const { container } = render(<BeachCard beach={summary} href="/beach/haeundae" />);
    expect(container.textContent).not.toMatch(/파고|조위|이안류/);
  });
});
