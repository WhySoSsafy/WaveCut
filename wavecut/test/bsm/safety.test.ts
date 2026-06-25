import { describe, it, expect } from "vitest";
import { waveStatus, ripStatus, familyStatus } from "@/lib/bsm/safety";

describe("waveStatus", () => {
  it("1m 이하(경계값)는 safe", () => expect(waveStatus(1)).toBe("safe"));
  it("0m는 safe", () => expect(waveStatus(0)).toBe("safe"));
  it("1.0001m(1 초과)는 caution", () => expect(waveStatus(1.0001)).toBe("caution"));
  it("2m는 caution", () => expect(waveStatus(2)).toBe("caution"));
});

describe("ripStatus", () => {
  it("'위험'은 danger", () => expect(ripStatus("위험")).toBe("danger"));
  it("'주의'는 caution", () => expect(ripStatus("주의")).toBe("caution"));
  it("'경계'는 caution", () => expect(ripStatus("경계")).toBe("caution"));
  it("'관심'은 caution", () => expect(ripStatus("관심")).toBe("caution"));
  it("'안전' 등 알 수 없는 값은 safe", () => expect(ripStatus("안전")).toBe("safe"));
  it("빈 문자열은 safe", () => expect(ripStatus("")).toBe("safe"));
});

describe("familyStatus", () => {
  it("true는 safe", () => expect(familyStatus(true)).toBe("safe"));
  it("false는 caution", () => expect(familyStatus(false)).toBe("caution"));
});
