# 설계: 웹 데이터출처 탭 제거 + 해변 상세 히어로 + 교통 탭

날짜: 2026-06-29
상태: 승인됨 (구현 진행)

## 목표
1. 사이드바 "데이터 출처" 탭 제거 (`/sources` 라우트 없어 404).
2. 웹 해변 상세 페이지(`/beach/[id]`)에 전체폭 히어로 사진 배너 추가.
3. 모바일 `/app/transit`에 해당하는 교통·접근성 화면을 웹에 새 탭으로 추가.

대상: `wavecut/` (Next.js 16, App Router). 배포 브랜치는 `master`.

## 1) 데이터 출처 탭 제거
- `components/web/Sidebar.tsx`의 `NAV` 배열에서
  `{ label: "데이터 출처", href: "/sources", icon: "doc" }` 항목 삭제.
- `/sources`를 참조하는 다른 코드 없음(확인됨). 상세 페이지 사이드의
  `DataSourcePanel` 컴포넌트는 별개이므로 유지.

## 2) 웹 해변 상세 — 전체폭 히어로 배너
- `app/(web)/beach/[id]/page.tsx`: 기존 텍스트 `.detailHead` 블록을 사진 위에
  올리는 **히어로 배너**로 변경.
  - 배경: `next/image` `fill` + `objectFit: cover`, `beachPhotoSrc(beach.id)` 재사용.
  - 사진 위 어두운 그라데이션 오버레이로 텍스트 가독성 확보.
  - 그 위에 기존 이름(`h1`)·`StatusPill`·메타(지역·해안선·날씨 등)·`ScoreGauge`를
    흰색 텍스트로 배치.
- `components/web/web.module.css`:
  - `.detailHero` (position: relative; overflow: hidden; border-radius; min-height ~200px;
    기존 그라데이션을 폴백 배경으로 유지).
  - 사진 레이어(z-index 0), 오버레이(z-index 1), 콘텐츠(z-index 2).
  - 사진 위에서 `.dhName h1` / `.dhMeta` 텍스트를 흰색으로(히어로 컨텍스트 한정).
- 폴백: 사진 없으면 기존 그라데이션 배경만 보임(깨지지 않음).

## 3) 웹 교통·접근성 탭
- **Sidebar NAV 추가:** `{ label: "교통·접근성", href: "/transit", icon: "transit" }`
  (운영자 대시보드 항목 아래).
- **새 라우트** `app/(web)/transit/page.tsx`:
  - 헤더 "교통·접근성" + 목업 데이터 안내 문구(모바일과 동일 취지).
  - 5개 해변(`BEACH_IDS`) **카드 그리드**(`web.module.css` 그리드, 2~3열 반응형).
  - 데이터: 기존 `lib/data/transit`의 `TRANSIT[id]` + `FALLBACK[id].name` 재사용.
- **새 컴포넌트** `components/web/WebTransitCard.tsx`:
  - props: `beachName: string`, `data: TransitData`.
  - 내용은 모바일 `TransitCard`와 동일(가장 가까운 역+호선 배지, 추천 출구,
    교통약자 접근성/엘리베이터 유무+비고)을 웹 패널 스타일로 표시.
  - `web.module.css`에 카드/행/배지 CSS 추가(기존 패널 토큰 재사용).

## 검증 기준
- 사이드바에 "데이터 출처" 없음. `/sources` 진입 경로 사라짐(404 유발 링크 제거).
- 5개 해변 상세 페이지(`/beach/<id>`) 모두 상단 히어로에 실사진 + 흰 텍스트 가독.
- `/transit` 진입 시 사이드바에 "교통·접근성" 탭 활성, 5개 교통 카드 그리드 렌더.
- `npm run build` 통과, 새 lint 에러 0. dev 서버 스크린샷으로 시각 확인.

## 비목표 (YAGNI)
- 교통 데이터 실 API 연동(목업 유지, 안내 문구로 명시).
- 상세 히어로에 사진 크레딧 표기(기존 정책대로 비노출).
- `DataSourcePanel` 자체 변경 또는 `/sources` 라우트 신설.
- 모바일 교통 화면 변경(웹만 추가).
