# 설계: WaveCut v2 개선 로드맵 (A→B→C→D)

날짜: 2026-06-29
상태: 승인됨 (A부터 순차 구현)

대상: `wavecut/` (Next.js 16). 배포 브랜치 `master`. 각 그룹은 자체 커밋·배포.
사용자 합의: i18n은 **전체 앱 5개국어 완전판**, 순서 **A→B→C→D**.

## A. 빠른 수정 (먼저)
1. 웹 로고(웨이브컷) 클릭 → 랜딩(`/`)으로 이동. `TopHeader` 브랜드를 `Link href="/"`로.
2. 동작하지 않는 상단 검색창 제거 (`TopHeader`의 `.webSearch`).
3. 수직 단면도 물 채움 애니메이션: 아래→위(scaleY) → **왼쪽→오른쪽(scaleX, 안전→위험)**.
   `crossSection.module.css`의 `.fillRise`/`xsecFillRise`를 transform-origin left + scaleX로.

## B. 데이터/기능
1. **부산 7개 해수욕장 전부**: 기존 5개 + 일광·임랑. 해수욕지수 API에 둘 다 실데이터
   존재 확인됨. 추가 작업: `fallback.ts`에 일광·임랑 정적정보+transects(대표 프로파일),
   `stations.ts` 격자/관측소(부산 DT_0005 공통), 위키미디어 사진→`public/beaches/`,
   `fcstBeach.ts` 이름 매핑 추가, BEACH_IDS 확장. 5곳 가정한 곳 전수 점검.
2. **위치 버그**: geolocation 실패("못 찾았다"). 타임아웃 상향(8s→15s),
   `enableHighAccuracy` 옵션 재검토, 권한/타임아웃/불가 메시지 세분화 + 재시도 버튼.
   로직(`nearestBeaches`)은 서울에서도 정상이므로 geolocation 호출 견고화에 집중.
3. **단면 수심보기 발견성**: 메인 기능인데 버튼이 지나쳐짐. 해변 상세 페이지에
   단면뷰 **미리보기를 임베드**(축소 CrossSection 또는 강한 비주얼 CTA)해서
   바로 보이게. (웹 상세 `app/(web)/beach/[id]`, 모바일 상세도.)

## C. 랜딩 개편
1. 히어로를 "사람이 마우스 따라 이동"이 아니라 **실제 단면선 드래그 + 수직 단면도**로
   재설계(메인 기능을 랜딩 전면에). 기존 `CrossSection` 패턴 활용/축약.
2. 마스코트 퀄업: 더 크게/눈 추적 보이게, 위치 재조정.
3. 배경에 **은은한 부산 바다 사진 흐림처리**(위키미디어에서 받아 `public/`에 저장).
4. 외국인 관광 앵글: "교통으로 오는 길" 등 관광 동선 강조 섹션.

## D. i18n — 전체 앱 5개국어 (한/영/일/중/스페인어)
- 접근: `[locale]` 라우팅은 (web)/(mobile)/(landing) 구조 변경이 커서, **경량
  `LocaleProvider` + 사전(JSON) + `t(key)`** 방식(쿠키/localStorage 저장, URL 불변)으로
  검토. 언어 전환기 UI(상단). 전 컴포넌트 문자열 추출 → ko 기준 → en/ja/zh/es 번역.
- 규모가 커 별도 스펙으로 상세화 예정(추출 범위·키 네이밍·전환기 위치·SSR 처리).

## 검증 (공통)
- 각 그룹 후 `npm run build` 통과, 변경 파일 lint 0, dev 스크린샷/인터랙션 확인,
  기존 테스트 143 유지.

## 비목표 (YAGNI)
- 부산 외 지역 해수욕장. CMS/번역 자동화 파이프라인. URL 기반 locale 라우팅(경량 방식 우선).
