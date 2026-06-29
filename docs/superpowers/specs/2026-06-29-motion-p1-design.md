# 설계: P1 — 모션/시각 보강 (단면뷰 · 운영자 · 메인)

날짜: 2026-06-29
상태: 승인됨 (구현 진행)

전체 로드맵(사용자 합의): **P1 모션 → P2 교통 상세페이지 → P3 실제 API+위치**.
각각 별도 스펙·구현 사이클. 본 문서는 P1.

대상: `wavecut/` (Next.js 16, App Router). 배포 브랜치 `master`.
공통 제약: 전부 CSS/SVG, 라이브러리 추가 없음, 모든 모션은
`prefers-reduced-motion: reduce`에서 정지. 기존 `CountUp`/패턴 재사용.
구현 순서: **단면뷰 → 운영자 → 메인** (임팩트 큰 것부터).

## 1) 단면 수심 뷰 (`components/shared/CrossSection.tsx`)
핵심 화면. 기존 드래그/탭 인터랙션·기하 로직(좌표·스케일·컬럼·해저)은 변경하지 않음.
추가만 한다.

1. **물결치는 수면**: 수면선(`SURFACE_Y`) 위에 드리프트하는 SVG 물결 path 1~2겹 +
   은은한 shimmer 가로선. 순수 CSS keyframe(translateX), 데이터 무관.
2. **물 차오름(조위 체감)**: 수심 컬럼 그룹을 `clipPath`(rect, height 0→full) wipe로
   위→아래 채움. `tideKey`(현재/1h/2h) 변경 시 애니메이션 재발화(React key에
   tideKey 포함)해 "조위 상승" 체감. reduced-motion이면 즉시 full.
3. **이안류 흐름 화살표**: `a.dangerStart != null`일 때 위험 구간에 바다 쪽으로
   흐르는 점선/화살표 애니메이션(stroke-dashoffset 또는 background flow).
4. 위 요소는 SVG 내부에 레이어로 추가. 컬럼/해저/위험표시 등 기존 요소 위·아래 적절히.

## 2) 운영자 대시보드 (`app/(web)/operator/page.tsx` + 컴포넌트)
현재 정적 프로토타입 데이터. 모션 추가.

1. **KPI 카운트업**: `KPI` 숫자(5·3) `CountUp`. "06:00"·mono 값은 정적 유지.
2. **LIVE 펄스 + 경보**: LIVE dot pulse, 위험 경보(`alertBar`) 좌측 바 pulse.
   경보 항목 마운트 시 위에서 살짝 슬라이드인(stagger).
3. **안전요원 배치 막대**: `deployBar` 채움(width 0→비율) 마운트 시 transition.
4. **AI 안내문 타자기**: 자동 생성 문안을 타이핑되듯 표시(`"use client"` 하위
   컴포넌트 `Typewriter`, reduced-motion이면 전체 즉시 표시).
5. (선택) **시간별 위험도 미니 sparkline**: KPI 영역에 작은 area 차트(목업 시계열).
   여유 있으면 추가, 없으면 생략.

## 3) 메인 대시보드 (`app/(web)/page.tsx` + 컴포넌트)
"비어 보임" 보완.

1. **오늘의 안전 분포 도넛**: 안전/주의/위험 개수를 채워지는 SVG 도넛(또는 스택바)으로.
   히어로 아래 작은 카드/패널. `"use client"` 컴포넌트 `StatusDonut`(arc
   stroke-dashoffset 애니메이션 + `CountUp` 라벨). reduced-motion 가드.
2. 해변 카드 게이지 카운트업은 기존 적용분 유지(추가 작업 없음).

## 신규 컴포넌트(예상)
- `components/web/Typewriter.tsx` (`"use client"`)
- `components/web/StatusDonut.tsx` (`"use client"`)
- (선택) 운영자 sparkline은 기존 `TideSparkline` 패턴 참고하거나 인라인.
- 단면뷰 모션은 `CrossSection.tsx` 내부 + `crossSection.module.css`.

## 검증 기준
- 단면뷰: 수면 물결 움직임, 시간대 탭 전환 시 물 차오름 재생, (위험 해변)
  이안류 화살표 흐름. 드래그/탭 기존 동작 유지.
- 운영자: KPI 카운트업, LIVE/경보 펄스, 배치 막대 채움, 안내문 타자기.
- 메인: 안전 분포 도넛 채워짐 + 라벨 카운트업.
- `prefers-reduced-motion: reduce`에서 모두 정지(최종 상태 표시).
- `npm run build` 통과, 변경 파일 새 lint 에러 0. dev 서버 스크린샷/좌표 샘플로 확인.

## 비목표 (YAGNI)
- 단면뷰 기하·도메인 로직(profile/levels/analyze) 변경.
- 실시간 데이터·실 API 연동(P3에서). 운영자/메인 모션은 기존 값/목업 기반.
- 입수자 실루엣, 메인 미니맵 등은 이번 범위 밖(원하면 후속).
- 캔버스/WebGL/물리 시뮬레이션.
