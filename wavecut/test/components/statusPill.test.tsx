import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusPill } from "@/components/shared/StatusPill";

describe("StatusPill", () => {
  it("기본 라벨을 status에서 가져온다", () => {
    render(<StatusPill status="safe" />);
    expect(screen.getByText("안전")).toBeDefined();
  });
  it("children으로 라벨을 덮어쓴다", () => {
    render(<StatusPill status="danger">위험구간</StatusPill>);
    expect(screen.getByText("위험구간")).toBeDefined();
  });
});
