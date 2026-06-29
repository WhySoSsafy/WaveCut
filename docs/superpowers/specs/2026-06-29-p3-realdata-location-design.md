# 설계: P3 — 실제 API 연동 + 위치(geolocation)

날짜: 2026-06-29
상태: 승인됨 (구현 진행)

대상: `wavecut/` (Next.js 16). 배포 브랜치 `master`.

## 현황(중요)
- `lib/api/*` (tide/weather/beachInfo/rip/wave/quality/bathymetry)에 data.go.kr·KMA
  연동 코드가 이미 있고, `getEnv`가 키 없으면 throw → `aggregate.ts`의
  `Promise.allSettled`가 받아 **FALLBACK(목업)으로 폴백**한다.
- 현재 `.env.local` 없음 + Vercel 환경변수 미설정 → **라이브는 전부 FALLBACK**.
- `lib/api/stations.ts`에 5개 해변 좌표(lat/lon)·관측소 코드 존재.

→ "실데이터"는 **사용자가 키를 발급/설정**해야 흐른다(코드로 키를 만들 수 없음).
   본 작업은 (a) 키 넣으면 바로 실데이터가 흐르도록 정비 + 정직한 상태표시,
   (b) 키 불필요한 **위치 기능**을 실제 구현, (c) 키 발급/설정 문서화로 한정.

## 1) 위치(geolocation) — "가까운 해변" (키 불필요, 핵심)
- `lib/data/geo.ts`: `STATIONS` 좌표 기반 `nearestBeaches(lat, lon)` →
  haversine 거리로 정렬된 `{ id, name, km }[]` 반환.
- `components/shared/NearbyBeach.tsx` (`"use client"`, 자체 CSS 모듈):
  - 버튼 "내 위치에서 가까운 해변 찾기" → `navigator.geolocation.getCurrentPosition`.
  - 성공: "가장 가까운 해변 · {name} {km}km" + 상세 링크 + 상위 거리 목록.
  - 실패/거부/미지원: 안내 문구로 graceful 처리. SSR 안전(마운트 후 동작).
- 배치: 웹 대시보드(히어로 아래 분포 카드 근처 1곳), 모바일 홈 상단 1곳.

## 2) 정직한 데이터 상태 표시
- `lib/api/dataMode.ts` (서버): `DATA_GO_KR_KEY`·`KMA_API_KEY` 존재 여부로
  `"live" | "fallback"` 반환.
- 웹 `TopHeader`: 현재 "실시간 · 06:00 갱신" 문구를 모드에 따라
  "실시간"(live) / "추정 데이터"(fallback)로 정직하게 표기.

## 3) 실데이터 연동 정비 + 문서
- `.env.local.example` 유지(이미 키 항목 있음). `lib/api/*`가 키 있을 때
  정상 동작하도록 흐름만 점검(로직 대규모 변경 없음, 폴백 안전).
- README에 "실데이터 연동" 섹션 추가: 어떤 키를 어디서 발급(data.go.kr, KMA)하고
  로컬 `.env.local` 및 **Vercel 프로젝트 환경변수**에 무엇을 넣는지 단계 안내.
- 교통(부산교통공사) 실연동은 별도 키 필요 → 본 범위 밖(목업 유지, 문구로 명시).

## 검증 기준
- `nearestBeaches` 단위 동작(좌표 입력 시 거리 정렬). 데모: 위치 허용 시 가장 가까운
  해변 표시(브라우저에서 위치 mock/실제로 확인).
- 데이터 상태 표시가 키 미설정 시 "추정 데이터"로 보임.
- `npm run build` 통과, 변경 파일 lint 0.

## 비목표 (YAGNI)
- 사용자 키 발급/Vercel 설정 대행(불가 — 안내만).
- 부산교통공사 실연동, 실시간 스트리밍, 지도 SDK 임베드(외부 지도는 P2의 딥링크로 충분).
- API 페처 로직 재작성(이미 존재, 폴백 안전).
