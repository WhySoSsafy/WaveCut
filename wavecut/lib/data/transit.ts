// MOCK 데이터 — 부산교통공사 역명정보/역세권정보/엘리베이터 API 연동 예정 (현재 프론트 목업)

import type { BeachId } from "@/lib/data/fallback";

export interface StationInfo {
  name: string;
  line: string;
  walkMin: number;
  tel?: string;
  note?: string; // e.g. "+ 버스 환승"
}

export interface ExitInfo {
  no: string;
  toward: string;
}

export interface AccessibleInfo {
  elevator: boolean;
  note: string;
  exitNo?: string;
}

export interface TransitData {
  station: StationInfo;
  exit: ExitInfo;
  accessible: AccessibleInfo;
}

export const TRANSIT: Record<BeachId, TransitData> = {
  haeundae: {
    station: {
      name: "해운대역",
      line: "2호선",
      walkMin: 5,
      tel: "1544-3300",
    },
    exit: {
      no: "3·5번",
      toward: "해수욕장 방향",
    },
    accessible: {
      elevator: true,
      note: "유모차·휠체어 이용 가능",
      exitNo: "7번 출구",
    },
  },
  gwangalli: {
    station: {
      name: "광안역",
      line: "2호선",
      walkMin: 10,
      tel: "1544-3300",
    },
    exit: {
      no: "3·5번",
      toward: "광안리해변 방향",
    },
    accessible: {
      elevator: true,
      note: "유모차·휠체어 이용 가능",
      exitNo: "5번 출구",
    },
  },
  songjeong: {
    station: {
      name: "송정역",
      line: "동해선",
      walkMin: 7,
      tel: "1544-3300",
    },
    exit: {
      no: "1번",
      toward: "송정해변 방향",
    },
    accessible: {
      elevator: true,
      note: "유모차·휠체어 이용 가능",
      exitNo: "1번 출구",
    },
  },
  songdo: {
    station: {
      name: "자갈치역",
      line: "1호선",
      walkMin: 15,
      tel: "1544-3300",
      note: "+ 버스 환승 필요",
    },
    exit: {
      no: "2번",
      toward: "버스 환승 (96번·7번)",
    },
    accessible: {
      elevator: true,
      note: "자갈치역 엘리베이터 이용 가능 (버스 환승 구간 별도 확인 필요)",
      exitNo: "2번 출구",
    },
  },
  dadaepo: {
    station: {
      name: "다대포해수욕장역",
      line: "1호선",
      walkMin: 3,
      tel: "1544-3300",
      note: "종점",
    },
    exit: {
      no: "4번",
      toward: "해수욕장 바로 앞",
    },
    accessible: {
      elevator: true,
      note: "전 출구 엘리베이터 설치 — 유모차·휠체어·고령층 이용 편리",
    },
  },
};
