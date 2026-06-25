# WaveCut — 작업 인계 문서 (HANDOFF)

> 다른 컴퓨터에서 이어서 작업하기 위한 자급식 문서. 마지막 업데이트: 2026-06-25

부산 해수욕장 안전·정보 서비스. 공공데이터 → 분석(BSM 엔진) → 체감 수심·안전등급 제공.
웹(PC 대시보드) + 모바일(390px 폰) 앱을 하나의 Next.js 앱으로 제공.

---

## 1. 빠른 시작 (새 컴퓨터에서)

```bash
git clone https://github.com/WhySoSsafy/WaveCut.git
cd WaveCut/wavecut          # ⚠️ 앱은 하위폴더 wavecut/ 안에 있음
npm install

# .env.local 생성 (아래 2번 참고) — 키는 본인 것 직접 입력. git에 안 올라감(gitignore)
npm run dev                 # http://localhost:3000
```

- 기본 브랜치: **`main`** (master도 동일 내용으로 존재). 이후 작업은 `main`에.
- 테스트: `npm test` (현재 **143개 통과**) · 빌드: `npm run build` (**30 라우트**)
- 스택: Next.js 16 (App Router, Turbopack) · TypeScript · React Server Components · CSS Modules · Vitest

---

## 2. 환경변수 (`wavecut/.env.local`) — 직접 생성 필요

`.env.local`은 gitignore 되어 git에 없음. 새 컴퓨터에서 아래 형식으로 **본인 키를 채워** 새로 만들 것:

```env
# 공공데이터포털(data.go.kr) 일반 인증키 — 날씨(기상청 단기예보)에 사용. ★현재 실연동 작동중★
DATA_GO_KR_KEY=여기에_본인_키

# 국립해양조사원(KHOA) 바다누리 키 — 조위/파고/수온(진행중)
KHOA_API_KEY=여기에_본인_키

# (미사용) 코드가 읽지 않음. 날씨는 DATA_GO_KR_KEY를 씀. 제거해도 무방.
KMA_API_KEY=여기에_본인_키
```

키가 없어도 앱은 **죽지 않고 fallback(더미) 데이터**로 정상 동작함 (모든 fetcher가 실패 시 null→fallback).

---

## 3. 현재 상태 — 무엇이 되어 있나

### 완료 (전부 Codex 리뷰 통과)
- **BSM 엔진** (`lib/bsm/`): 수심 단계/단면 분석/안전점수/상황별 권장행동/해양안전 상태판정. 순수 함수 + 테스트.
- **API 레이어** (`lib/api/`): 7개 공공데이터 fetcher + `aggregate.ts`(`getAllSummaries`/`getBeachDetail`). 모든 fetcher는 total/never-throw → 실패 시 fallback.
- **웹 앱** (`app/(web)/`): `/`(대시보드) · `/beach/[id]`(상세+전문패널5) · `/beach/[id]/xsec`(단면 수심뷰) · `/operator`(운영자).
- **모바일 앱** (`app/(mobile)/app/`): `/app`(홈) · `/app/beach/[id]`(상세) · `/app/beach/[id]/xsec` · `/app/favorites` · `/app/mypage` · **`/app/transit`(교통·접근성, 목업)**.
- **즐겨찾기**: 로그인 없음, localStorage 기반(새로고침 유지, 지워져도 무방). `FavoritesProvider`/`FavoriteButton`/`FavoritesList`.
- **실시간 날씨 연동** ✅: 기상청 단기예보로 **기온/풍속/하늘상태** 실데이터. UV는 별도 API라 fallback.
- **교통·접근성 탭** (목업): 해수욕장별 가까운 역/추천 출구/엘리베이터 접근성. `lib/data/transit.ts`(MOCK).

### 데이터 소스 상태
| 소스 | 상태 | 비고 |
|---|---|---|
| 날씨(기온/풍속/하늘) | ✅ 실연동 | `DATA_GO_KR_KEY`, 기상청 getUltraSrtNcst+getUltraSrtFcst |
| UV(자외선) | fallback | 별도 자외선지수 API 필요 |
| 조위/파고/수온 | ⏳ 진행중 | KHOA — 4번 참고 |
| 이안류/수질/해변정보 | fallback | data.go.kr 실엔드포인트/코드 미확보 |
| 교통/접근성 | 목업 | 부산교통공사 API 연동 예정 |

---

## 4. ⏳ 진행중: KHOA 실데이터(조위/파고/수온) — 이어서 할 것

### 핵심 발견
1. **KHOA(`khoa.go.kr`)는 해외 IP를 차단함.** 한국 IP(본인 PC)에서만 응답. → 클라우드/해외 서버(예: Vercel 미국 리전)에선 안 됨. 나중에 실배포 시 **Vercel 리전을 서울(icn1)** 로 두고 **런타임(dynamic) 호출**로 처리해야 함.
2. **진짜 엔드포인트**(코드의 옛 추측 `/api/oceangrid/...`는 404였음):
   ```
   https://khoa.go.kr/oceandata/api/beach/search.do?ServiceKey=<KHOA키>&BeachCode=BCH001&ResultType=json
   ```
   이 **하나의 API**가 조위(tide)·파고(wave_height)·수온(water_temp)·풍속(wind_speed)·풍향(wind_direct)을 해수욕장 코드별로 제공.
3. 응답 스키마 (샘플):
   ```json
   { "result": {
     "data": [{ "tide": 3, "water_temp": 17.1, "wind_speed": 0.6, "wind_direct": "서북서",
                "obs_time": "2021-06-01 00:00:00",
                "day1_am_status": "좋음", "day1_pm_status": "매우좋음", "day2_am_status": "...", "...": "..." }],
     "meta": { "beach_code": "BCH001", "beach_name": "해운대해수욕장", "obs_post_name": "부산",
               "obs_last_req_cnt": "800/20000" } } }
   ```
   (`wave_height`는 관측소별 미제공일 수 있음.)

### 다음 단계 (정확한 TODO)
1. **본인 PC(한국)** 에서 키 검증 + 실값 확인:
   ```bash
   cd wavecut
   node scripts/probe-khoa.mjs            # BCH001(해운대)
   node scripts/probe-khoa.mjs BCH002     # 다른 코드 테스트
   ```
   → HTTP 200 + 실제 수온/풍속이 나오면 키 정상. `국립해양조사원-오류`면 키 미승인/오타(키 길이 23자라 잘렸는지 확인).
2. **나머지 4개 해수욕장 BeachCode 확보** (현재 해운대=BCH001만 앎). KHOA 문서의 "관측소 목록보기"에서 광안리/송정/송도/다대포 코드 찾기.
3. **연동 구현**:
   - `lib/api/stations.ts`의 `StationMap`에 `beachCode` 필드 추가, 5개 채움.
   - 새 fetcher(예: `lib/api/khoaBeach.ts`)에서 `https://khoa.go.kr/oceandata/api/beach/search.do` 호출, `result.data[0]`에서 tide/wave_height/water_temp/wind_speed/wind_direct 파싱. **total/never-throw 유지**(실패→null).
   - 키는 `KHOA_API_KEY` 사용(`getEnv`), `encodeURIComponent` 적용.
   - `aggregate.ts`에서 이 결과를 wave/tide/water/windSpeed에 매핑(기존 `?? fb.x` 폴백 패턴 유지).
   - 단위 테스트는 **MOCK JSON**으로만(라이브 호출 테스트 금지).
4. **체감수심 t1/t2 주의**: 이 API의 `tide`는 현재값 1개라 "1·2시간 후" 예측은 별도 처리 필요(또는 fallback 유지).
5. **검증**: 한국 PC에서 `npm run dev` → `/beach/haeundae` 실값 확인.

---

## 5. 코드 지도

```
wavecut/
├─ app/
│  ├─ (web)/        # PC: layout(사이드바)+page(/)+beach/[id]+xsec+operator
│  ├─ (mobile)/     # 모바일: layout(390px+하단탭)+app/(home/beach/favorites/mypage/transit)
│  ├─ api/          # /api/beaches, /api/beach/[id] (aggregate JSON)
│  └─ layout.tsx    # 루트, styles/globals.css 임포트
├─ components/{shared,web,mobile}/
├─ lib/
│  ├─ bsm/          # 분석 엔진(순수함수): profile, score, levels, aiComment, safety, types
│  ├─ api/          # fetcher 7종 + aggregate + stations + env
│  └─ data/         # fallback.ts(5해변+BEACH_IDS), transit.ts(목업)
├─ styles/          # globals.css, tokens.css (--mono 등 디자인토큰)
├─ scripts/probe-khoa.mjs   # KHOA 응답 확인용 (한국 IP에서 실행)
└─ test/            # vitest (bsm/api/components/data)
```

### 꼭 지킬 규칙
- **정보 위계 (절대 준수)**: 카드/홈/리스트엔 쉬운 정보만(날씨/자외선/혼잡/안전등급). **전문 정보(파고/조위/이안류/가족추천)는 상세 화면에서만.** (운영자 대시보드 `/operator`는 전문가용이라 예외)
- 페이지는 Server Component. Client는 `CrossSection`, `BottomTabBar`, 즐겨찾기 컴포넌트만.
- 흰 배경은 `#fff` 직접 사용(프로젝트 관례, 전용 토큰 없음). `--mono` 등 색/폰트는 `styles/tokens.css` 토큰 사용.
- `[id]` 페이지는 `generateStaticParams`(BEACH_IDS) + `notFound()`.

---

## 6. 배포 (Vercel)

- **방법**: Vercel 대시보드에서 GitHub 저장소 import (CLI는 이 PC 호스트명 한글 때문에 막힘).
- ⚠️ **Root Directory = `wavecut`** 로 설정 (안 하면 빌드 실패).
- 환경변수에 `DATA_GO_KR_KEY` 추가 → 날씨 실데이터 동작.
- **Production Branch = `main`** 으로 설정.
- KHOA 데이터는 Vercel 기본(미국) 리전에선 안 됨(지오차단). KHOA 붙일 땐 리전 서울(icn1)+런타임 호출 필요.

---

## 7. 작업 방식 / 이력

- 방식: subagent-driven development(태스크별 구현 서브에이전트) + **각 태스크 Codex CLI 컨펌**.
- 상세 이력 원장: `.superpowers/sdd/progress.md` (로컬 스크래치, git 미추적일 수 있음 — 새 PC엔 없을 수 있음). 본 HANDOFF가 자급식 요약본.
- 이어서 작업할 때도 같은 방식 권장: 구현 → `npm test`/`npm run build` → (가능하면) Codex 리뷰 → 커밋 → `main` 푸시.

---

## 8. 자주 막히는 것 (Gotchas)

- KHOA 404 = 거의 항상 (a) 해외 IP 지오차단, 또는 (b) 옛 엔드포인트(`/api/oceangrid/`) — 진짜는 `/oceandata/api/beach/search.do`.
- Vercel CLI가 `is not a legal HTTP header value`로 죽으면 = PC 호스트명에 한글("2층PC048"). 대시보드 import 사용.
- data.go.kr 키는 Encoding/Decoding 두 형태. 코드에서 `encodeURIComponent` 적용 중(저장키는 raw/decoding 형태 가정).
- 날씨 API는 짧은 시간 다중 호출 시 429(rate limit). 정상 사용(요청당 1회, 1h revalidate)에선 문제 없음.
