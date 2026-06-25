import type { BeachId } from "@/lib/data/fallback";

export interface StationMap {
  lat: number; lon: number;
  tideObsCode: string;  // 국립해양조사원 조위관측소 코드
  gridX: number;        // 기상청 격자 X (nx)
  gridY: number;        // 기상청 격자 Y (ny)
  waveGrid: string;     // 파랑 격자번호
  ripCode: string;      // 이안류 해수욕장 코드
  beachInfoCode: string;// 해수욕장 정보 코드
  qualityCode: string;  // 부산 수질 측정지점 코드
}

export const STATIONS: Record<BeachId, StationMap> = {
  haeundae:  { lat: 35.1587, lon: 129.1604, tideObsCode: "DT_0063", gridX: 99, gridY: 75, waveGrid: "", ripCode: "", beachInfoCode: "", qualityCode: "" },
  gwangalli: { lat: 35.1532, lon: 129.1185, tideObsCode: "DT_0063", gridX: 98, gridY: 75, waveGrid: "", ripCode: "", beachInfoCode: "", qualityCode: "" },
  songjeong: { lat: 35.1786, lon: 129.2003, tideObsCode: "DT_0063", gridX: 100, gridY: 76, waveGrid: "", ripCode: "", beachInfoCode: "", qualityCode: "" },
  songdo:    { lat: 35.0758, lon: 129.0166, tideObsCode: "DT_0051", gridX: 97, gridY: 74, waveGrid: "", ripCode: "", beachInfoCode: "", qualityCode: "" },
  dadaepo:   { lat: 35.0494, lon: 128.9663, tideObsCode: "DT_0051", gridX: 96, gridY: 73, waveGrid: "", ripCode: "", beachInfoCode: "", qualityCode: "" },
};
