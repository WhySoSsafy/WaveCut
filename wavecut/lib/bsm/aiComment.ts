import type { AnalyzeResult } from "./profile";
import type { SafetyStatus } from "./types";

export function positionName(p: number): "좌측" | "중앙" | "우측" {
  return p < 0.34 ? "좌측" : p < 0.67 ? "중앙" : "우측";
}

export function aiComment(a: AnalyzeResult, p: number): string {
  const pos = positionName(p);
  let body = `현재 선택한 ${pos} 단면은 해안선에서 약 ${a.kneeEnd}m까지 무릎 수심으로 가족 이용에 적합합니다.`;
  if (a.dangerStart) {
    body += ` ${a.dangerStart}m 이후부터 수심이 빠르게 깊어지므로 어린이와 초보자는 주의가 필요합니다.`;
  } else {
    body += ` 측정 구간 전반에서 급격한 수심 변화는 확인되지 않습니다.`;
  }
  return body;
}

export interface SituationTip {
  key: "family" | "begin" | "after" | "crowd";
  icon: string;
  status: SafetyStatus;
  title: string;
  desc: string;
}

export function situationTips(
  a: AnalyzeResult,
  opts: { family: boolean; crowd: string }
): SituationTip[] {
  const danger = a.dangerStart;
  return [
    {
      key: "family", icon: "family", status: opts.family ? "safe" : "caution", title: "가족 동반",
      desc: `해안선 ${a.kneeEnd}m까지 무릎 이하 수심입니다. 어린이는 이 구간 안에서 보호자와 함께 물놀이하세요.`,
    },
    {
      key: "begin", icon: "wave", status: danger ? "caution" : "safe", title: "수영 초보자",
      desc: danger
        ? `${danger}m 이후부터 수심이 빠르게 깊어집니다. 구명조끼를 착용하고 안전선 안쪽을 이용하세요.`
        : `급격한 수심 변화는 없지만 입수 시 항상 안전선 안쪽에 머물러주세요.`,
    },
    {
      key: "after", icon: "tide", status: "caution", title: "오후 방문 예정",
      desc: `오후로 갈수록 조위가 상승해 같은 위치의 체감 수심이 한 단계 깊어집니다. 16시 이후에는 수심을 다시 확인하세요.`,
    },
    {
      key: "crowd", icon: "crowd", status: opts.crowd === "많음" ? "caution" : "safe", title: "혼잡 시간 방문",
      desc: opts.crowd === "많음"
        ? `현재 혼잡도가 높습니다. 일행과 떨어지지 않도록 하고 안전요원의 안내 구역을 확인하세요.`
        : `혼잡도가 높지 않아 여유롭게 이용할 수 있습니다.`,
    },
  ];
}
