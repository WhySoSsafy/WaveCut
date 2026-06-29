# 설계: WaveCut 인터랙티브 랜딩페이지

날짜: 2026-06-29
상태: 승인됨 (구현 진행)

대상: `wavecut/` (Next.js 16, App Router). 배포 브랜치 `master`.
공통 제약: SVG/CSS 기반(무거운 라이브러리 없음), `prefers-reduced-motion`에서
인터랙션·모션 정지(정적 폴백), 모바일 대응.

## 콘셉트 (확정)
- 풀 스크롤 랜딩, 루트 `/`에 배치. 히어로는 **수심 메타포 인터랙티브** +
  **구명튜브 마스코트(눈이 커서를 따라 움직임)**.

## 1) 라우팅 변경
- 신규 `app/(landing)/page.tsx` + `app/(landing)/layout.tsx`(사이드바 없음,
  투명/미니 상단바: 로고 + "서비스 들어가기" CTA) → `/`.
- 대시보드 `app/(web)/page.tsx` → `app/(web)/dashboard/page.tsx` (`/dashboard`).
- `components/web/Sidebar.tsx`의 "메인 대시보드" href `/` → `/dashboard`,
  `exact` 매칭 갱신. 로고/브랜드 링크 등 `/` 참조 전수 점검·수정.
- 랜딩의 모든 "들어가기/시작" CTA → `/dashboard`.
- 모바일(`/app/*`)은 변경 없음.

## 2) 히어로 — 인터랙티브 (`LandingHero`, "use client")
- 풀 뷰포트. 헤드라인 "우리 가족 바다, 지금 안전한가요?" + 부제 + CTA
  ("서비스 들어가기 →" /dashboard, 보조 "기능 보기 ↓" 스크롤).
- **수심 메타포 인터랙션**: 모래→바다 단면 SVG 위에서 커서 x를 따라 입수자 마커가
  이동하고, 그 위치의 **체감 수심(물없음·발목·무릎·허리·가슴·머리)** 라벨·색이
  실시간 갱신(해안가 얕음 → 먼바다 깊음). 기존 LEVELS 색 언어 재사용.
- **물결**: 수면 드리프트(기존 `WaveDivider` 또는 인라인) + **커서 잔물결(ripple)**
  (mousemove 시 확장·소멸하는 원, rAF 스로틀, 개수 상한).
- **구명튜브 마스코트**: 플랫 SVG 구명튜브(빨강/흰 + 얼굴). **눈동자가 커서 방향으로
  이동**(각 눈 중심 기준 제한된 반경 내 이동) + 살짝 기울이며 둥둥(bob).
- 성능: mousemove는 rAF 스로틀, 상태 최소화. reduced-motion이면 마커는 중앙 고정,
  마스코트 눈 정면, 물결/ripple 정지.

## 3) 스크롤 섹션 (`landing.module.css`, 스크롤-리빌)
스크롤-리빌은 작은 클라이언트 훅 `useReveal`(IntersectionObserver)로 진입 시 페이드/슬라이드.
1. **문제 제기** — "평온해 보여도 몇 걸음이면 위험" + 급경사/이안류 한 줄·아이콘.
2. **체감 수심 개념** — 숫자가 아닌 6단계(색 칩: 물없음~머리이상) 핵심 아이디어.
3. **핵심 기능** — 단면 수심 뷰 · 실시간 해양데이터 · 교통·접근성 · 운영자 대시보드
   (아이콘 카드 4개, 기존 `Icon` 재사용).
4. **실데이터 신뢰** — "기상청 · 국립해양조사원 공공데이터 실연동" + 파고·수온·조위
   실시간 강조(출처 칩). 실제 검증된 연동을 셀링 포인트로.
5. **부산 5개 해변** — 실제 사진(`beachPhotoSrc`) 카드, 각 `/beach/<id>` 링크.
6. **CTA 푸터** — "지금 우리 동네 해변 확인" + 들어가기 버튼 + 공모전·데이터 출처 명시.

## 신규/변경 파일(예상)
- 신규: `app/(landing)/page.tsx`, `app/(landing)/layout.tsx`,
  `components/landing/LandingHero.tsx`, `components/landing/LifeRing.tsx`(마스코트),
  `components/landing/landing.module.css`, `lib/hooks/useReveal.ts`(또는
  `components/landing` 내부).
- 이동: `app/(web)/page.tsx` → `app/(web)/dashboard/page.tsx`.
- 수정: `components/web/Sidebar.tsx`(링크), 기타 `/` 참조.

## 검증 기준
- `/`가 랜딩, `/dashboard`가 대시보드로 정상 동작. 사이드바·로고 링크 깨짐 없음.
- 히어로: 커서 따라 마커 이동 + 체감수심 라벨/색 변화, 마스코트 눈 커서 추적,
  커서 잔물결, 수면 물결. reduced-motion에서 정지.
- 스크롤 섹션 리빌 동작, 5개 해변 사진·링크 정상.
- 모바일에서 레이아웃 깨짐 없음(마우스 없으면 마커 자동 시연/중앙, 터치 가능).
- `npm run build` 통과, 변경 파일 새 lint 0, dev 스크린샷 확인.

## 비목표 (YAGNI)
- 손 달린 정교한 일러스트 캐릭터(어설픔 위험 → 구명튜브 눈 추적으로 한정).
- 캔버스/WebGL/물리엔진, 스크롤 스크럽 비디오.
- 다국어, A/B 테스트, CMS.
- 모바일 전용 별도 랜딩(반응형으로 처리).
