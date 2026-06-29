# 설계: 해변 실사진 적용 (Beach Real Photos)

날짜: 2026-06-29
상태: 승인됨 (구현 대기)

## 목표
프론트엔드의 사진 플레이스홀더(아이콘 박스·그라데이션)를 부산 5개 해수욕장의
**실제 사진**으로 교체해 시각 퀄리티를 올린다. 출처는 위키미디어 커먼즈 등
자유 라이선스 이미지. 부산시 공모전 제출용 MVP이므로 시연 안정성을 우선한다.

대상 해변: `haeundae`, `gwangalli`, `songjeong`, `songdo`, `dadaepo`
(`wavecut/lib/data/fallback.ts`의 `BEACH_IDS`).

## 범위 (확정)
사진이 들어갈 4개 자리 **전부**, 5개 해변 모두:
1. 모바일 해변 카드 **썸네일** — `components/mobile/AppBeachCard.tsx` (44px, `.arowThumb`)
2. 모바일 상세 **히어로 스트립** — `app/(mobile)/app/beach/[id]/page.tsx` (`.aDetailHero`)
3. 모바일 홈 **추천 카드** — featured beach (`.aRec`)
4. 웹 **페이지 히어로** — `components/web/HeroCard.tsx` (`.pageHero`)

## 결정 사항
- **저장:** 로컬 다운로드 → `wavecut/public/beaches/<id>.webp` (핫링크 아님).
  공모전 시연에서 외부 의존·CORS·핫링크 차단 리스크를 제거하기 위함.
- **출처 표기:** 메타데이터만 기록(`credits.json`), **화면 비노출**.
- **파일 수:** 해변당 webp 1장(가로 ~1600px). 자리별 비율 차이는
  `object-fit: cover` 로 크롭. 여러 사이즈는 `next/image`가 자동 최적화.

## 아키텍처 / 컴포넌트

### 1) 소싱 & 변환 파이프라인
- 위키미디어 커먼즈에서 해변별 자유 라이선스(공공도메인 또는 CC-BY/CC-BY-SA)
  가로형 사진 1장씩 큐레이션. 라이선스/저작자/원본 URL 확인.
  - 브라우징은 글로벌 규칙에 따라 **`/browse` 스킬** 사용.
- 일회성 스크립트 `wavecut/scripts/fetch-beach-photos.ts`:
  - 큐레이션한 원본 URL 목록을 입력으로 받아 다운로드.
  - **webp 변환**(가로 1600px로 리사이즈, 품질 ~80). 변환 도구는 `sharp`
    (devDependency) 우선, 없으면 macOS `sips`/`cwebp` 폴백.
  - 결과를 `public/beaches/<id>.webp` 로 저장하고 `credits.json` 갱신.
- 변환 결과 파일은 리포에 커밋.

### 2) 출처 메타데이터
- 경로: `wavecut/public/beaches/credits.json`
- 형태:
  ```json
  {
    "haeundae": {
      "author": "촬영자명",
      "license": "CC-BY-SA-4.0",
      "source": "https://commons.wikimedia.org/wiki/File:...",
      "title": "원본 파일명"
    }
  }
  ```
- 화면 비노출. 출처 추적용 기록만 유지.

### 3) UI 연동
모두 `next/image` `<Image>` + `object-fit: cover`. 기존 레이아웃/크기 유지,
배경만 실사진으로 교체.

1. **썸네일(44px):** 햇살 아이콘 박스 → 사진 cover, 둥근 12px 모서리 유지.
2. **상세 히어로:** 그라데이션 위 사진 배경 + **어두운 그라데이션 오버레이**,
   그 위 상태 Pill·점수 게이지 그대로.
3. **추천 카드:** 카드 상단 사진 배너.
4. **웹 히어로:** 네이비 그라데이션 → 사진 배경 + 그라데이션 오버레이,
   기존 흰 텍스트/요약 유지.

**가독성:** 히어로류는 사진 위 어두운 그라데이션 오버레이로 흰 텍스트 가독성 확보.

**폴백:** 해당 해변 사진 파일이 없으면 기존 아이콘/그라데이션을 그대로 렌더
(깨지지 않게). 컴포넌트에서 파일 존재를 가정하지 않고 graceful degrade.

## Next.js 주의
`wavecut/AGENTS.md` 경고: 이 Next.js는 버전이 달라 API가 학습 데이터와 다를 수
있음. `<Image>` 작성 전 `node_modules/next/dist/docs/`의 image 가이드를 먼저
읽고 구현. `next.config.ts`에서 로컬 이미지 최적화가 기본 동작하는지 확인.

## 검증 기준
- `public/beaches/`에 5개 `<id>.webp` 파일 존재.
- `credits.json`에 5개 항목 모두 author/license/source/title 채워짐.
- dev/`next build`에서 4개 자리 모두 사진이 cover로 정상 렌더, 히어로 텍스트 가독.
- 사진 파일을 임시 제거해도 폴백 UI로 깨지지 않음.

## 비목표 (YAGNI)
- 화면 내 크레딧 캡션 UI (메타데이터만 기록).
- 해변당 여러 컷/사이즈 사전 분할.
- 사진 갤러리·라이트박스 등 추가 기능.
- 단면도·지도 등 사진 외 시각요소 변경.
