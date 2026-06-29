# 설계: WaveCut 모션 패키지

날짜: 2026-06-29
상태: 승인됨 (구현 진행)

## 목표
시각적으로 "살아있는" 느낌을 주되, 모션이 제품 메시지(안전·수심·바다·접근성)를
강화하도록 한다. 전부 CSS/SVG 기반(무거운 라이브러리 없음), 접근성 위해
`prefers-reduced-motion: reduce`에서 모든 모션 비활성.

대상: `wavecut/` (Next.js 16, App Router). 배포 브랜치 `master`.
구현 순서: **B → A → D → C** (설득력 높은 것부터, 중간에 끊겨도 임팩트 남게).

## 0) 공통 primitive (신규)
- `components/shared/CountUp.tsx` (`"use client"`): 숫자를 0→value로 rAF 카운트업
  (~900ms ease-out). props: `value:number`, `suffix?:string`, `duration?:number`,
  `className?`. reduced-motion이면 즉시 value 렌더.
- `components/shared/WaveDivider.tsx` (서버 컴포넌트 가능, 순수 SVG+CSS): 2겹 물결
  path + CSS keyframe로 좌우 드리프트. props: `className?`, `color?`, `opacity?`.
- 모션 keyframe은 각 모듈 CSS에 두되, reduced-motion 미디어쿼리로 `animation: none`.

## B) 데이터 모션
1. **ScoreGauge** (`components/shared/ScoreGauge.tsx`):
   - `"use client"`로 전환. 마운트 시 컬러 아크의 `strokeDashoffset`을 c(빈 상태)→off
     로 CSS transition(~1s ease-out)으로 채움. useEffect로 마운트 후 상태 토글.
   - 가운데 숫자는 `CountUp`으로 0→score.
   - reduced-motion이면 transition/카운트업 없이 최종값.
   - 서버 컴포넌트들이 렌더해도 무방(클라이언트 자식 허용).
2. **TideForecastPanel** (`components/web/TideForecastPanel.tsx`):
   - 패널 상단에 **조위 곡선 미니 그래프**(SVG) 추가: 현재·1h·2h 3점의 수심 높이
     (`0.8 + offset`)를 라인+영역으로. 마운트 시 라인이 좌→우로 그려지고(stroke-dash)
     영역이 차오름. 기존 막대 행은 아래 상세로 유지.
   - 그래프 애니메이션 위해 작은 `"use client"` 하위 컴포넌트(`TideSparkline`)로 분리.
3. **웹 HeroCard 요약 숫자** (`components/web/HeroCard.tsx`): safe/caution/danger/total
   숫자를 `CountUp`으로. (HeroCard는 서버 컴포넌트지만 CountUp 자식만 클라이언트.)

## A) 바다 물결
- `WaveDivider`를 히어로 하단에 배치: 웹 메인 히어로(`.pageHero`), 웹 상세 히어로
  (`.detailHero`), 모바일 상세 히어로(`.aDetailHero`). 사진/그라데이션 위 z-index로
  은은하게. 텍스트 가독 해치지 않게 하단 정렬 + 낮은 opacity.

## D) 위험 강조
1. **StatusPill** (`components/shared/StatusPill.tsx`): status가 `caution`/`danger`일 때
   dot에 pulse 링(CSS keyframe `box-shadow` 확산). `safe`는 정적.
2. **이안류 흐름**: 해양안전 패널의 이안류 지표가 `caution`/`danger`이면 흐르는 점선
   화살표 애니메이션. `Stat`은 범용이므로, OceanSafetyPanel에서 이안류 행에 한해
   작은 흐름 인디케이터(`.ripFlow`, CSS `background-position` 흐름)를 덧붙임.

## C) 교통 모션
- 교통 카드(웹 `WebTransitCard` + 모바일 `TransitCard`)의 "가장 가까운 역" 행 아래에
  가는 노선 트랙 + 차량 아이콘이 역→해변으로 무한 슬라이드(순수 CSS `translateX`).
  아이콘은 기존 `transit` 아이콘 사용. 트랙은 점선.

## 검증 기준
- 각 화면 dev 서버 스크린샷(가능하면 GIF)으로 모션 동작 확인:
  게이지 차오름, 조위 그래프, 카운트업, 히어로 물결, 주의/위험 pulse, 교통 차량 이동.
- `prefers-reduced-motion: reduce` 에뮬레이션에서 모션 정지(값/상태는 최종 표시).
- `npm run build` 통과, 변경 파일 새 lint 에러 0.

## 비목표 (YAGNI)
- 물리 시뮬레이션/캔버스/WebGL, 스크롤 연동 패럴랙스.
- 실시간 데이터 스트리밍(모션은 마운트/루프 기반).
- 단면도(CrossSection) 내부 로직 변경(이번 범위는 패널/카드/히어로/게이지).
- 모바일 홈 추천 카드 물결(히어로류로 한정; 필요 시 후속).
