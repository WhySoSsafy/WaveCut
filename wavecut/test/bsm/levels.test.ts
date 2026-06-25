import { describe, it, expect } from "vitest";
import { levelOf } from "@/lib/bsm/levels";

describe("levelOf", () => {
  it("0.02m 이하는 물 없음", () => {
    expect(levelOf(0).key).toBe("none");
    expect(levelOf(0.02).key).toBe("none");
  });
  it("0.1m는 발목", () => { expect(levelOf(0.1).key).toBe("ankle"); });
  it("0.3m는 무릎", () => { expect(levelOf(0.3).key).toBe("knee"); });
  it("0.6m는 허리(주의)", () => {
    expect(levelOf(0.6).key).toBe("waist");
    expect(levelOf(0.6).status).toBe("caution");
  });
  it("1.0m는 가슴", () => { expect(levelOf(1.0).key).toBe("chest"); });
  it("1.5m 이상은 머리(위험)", () => {
    expect(levelOf(1.5).key).toBe("head");
    expect(levelOf(2.0).status).toBe("danger");
  });
});
