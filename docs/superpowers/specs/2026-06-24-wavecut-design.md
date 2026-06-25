# WaveCut 웨이브컷 — 구현 설계 문서

**날짜:** 2026-06-24  
**대상:** 부산시 공공데이터 AI 활용 경진대회 제출용 MVP  
**서비스:** 부산 해수욕장 안전 정보 서비스 (웹 대시보드 + 모바일 웹앱)

---

## 1. 확정 스택

| 항목 | 결정 |
|---|---|
| 프레임워크 | Next.js 15 (App Router + TypeScript) |
| 백엔드 | Next.js Route Handlers (공공 API 프록시) |
| 스타일 | CSS Variables (디자인 토큰) + CSS Modules |
| 배포 | Vercel (환경변수로 API 키 관리) |
| 앱 | 별도 React Native 없음 — `/app` URL로 모바일 웹 |
| AI 코멘트 | 규칙 기반 (LLM 미사용) |
| 상태 관리 | React useState (전역 라이브러리 없음) |

---

## 2. 라우팅 구조

```
/                           → 웹 대시보드 메인
/beach/[id]                 → 웹 해수욕장 상세
/beach/[id]/xsec            → 웹 단면 수심 뷰
/operator                   → 운영자 대시보드

/app                        → 모바일 홈 (QR 진입점)
/app/beach/[id]             → 모바일 해수욕장 상세
/app/beach/[id]/xsec        → 모바일 단면 수심 뷰
```

Next.js App Router Route Groups 사용:
- `app/(web)/` → 사이드바 레이아웃 공유
- `app/(app)/app/` → 하단 탭바 레이아웃 공유
- `app/api/` → Route Handlers (공공 API 프록시)

---

## 3. 데이터 레이어

### 3-1. 정보 위계 원칙 (설계 핵심 — 반드시 유지)

- **카드/홈:** 해수욕장명, 날씨·기온, 자외선, 혼잡도, 안전 배지만 노출
- **카드 노출 금지:** 파고, 조위, 이안류, 가족 추천 여부
- **상세 화면:** 쉬운 정보 + 파고·조위·이안류·가족추천 + "단면 수심 보기" 진입
- **단면 수심 뷰 하단:** AI 안전 코멘트 + 상황별 권장 행동

### 3-2. 공공 API 매핑 (1차 MVP)

| Route Handler | 공공 API | 제공 데이터 |
|---|---|---|
| `/api/bathymetry/[beachId]` | 국립해양조사원 자연과학용 수심정보 | 150m 격자 위경도+수심값 |
| `/api/tide/[beachId]` | 국립해양조사원 조위관측소 최신 관측데이터 | 현재 조위(m), 조위 추세, 1·2시간 후 예보 조위(tideOffset 계산용) |
| `/api/beach/[beachId]` | 국립해양조사원 해수욕장 정보 | 파고, 수온, 풍속, 풍향 |
| `/api/coastline/[beachId]` | 국립해양조사원 해안선 | 모래사장/해안선/바다 구분 (빌드 시 정적 GeoJSON) |
| `/api/rip/[beachId]` | 국립해양조사원 이안류 지수 조회 | 관심/주의/경계/위험 + 파고·파주기·수온·풍향·풍속 |
| `/api/wave/[beachId]` | 해양수산부 파랑 3분 서비스 | 파고, 파향, 평균파주기 |
| `/api/quality/[beachId]` | 부산광역시 해수욕장 수질 정보 | 장구균, 대장균, 수질평가 |
| `/api/weather/[beachId]` | 기상청 전국 해수욕장 날씨 조회 | 날씨, 기온, 풍속, 바다 상태 |

> 해안선 데이터는 실시간 변화 없음 → 빌드 타임에 GeoJSON 변환 후 정적 파일 내장.  
> 나머지는 Server Component에서 직접 fetch (`next: { revalidate: 3600 }`).

### 3-3. 데이터 흐름

```
[Server Component (페이지)]
  └─ lib/api/* 에서 공공 API 직접 호출 (API 키 서버에서만 사용)
  └─ BSM 엔진으로 가공 (levelOf, analyze, score 계산)
  └─ 완성된 데이터를 props로 Client Component에 전달

[CrossSection — Client Component]
  └─ 초기 bathymetryData, tideOffset은 Server Component에서 props로 수신
  └─ 드래그(p), 시간대(tideKey) 변경 → BSM 엔진 재계산 (API 재호출 없음)
  └─ 순수 계산이므로 외부 상태 라이브러리 불필요
```

### 3-4. 에러 처리

공공 API 실패 시 `null` 반환 → fallback 하드코딩 값으로 대체.  
심사 당일 API 불안정해도 서비스가 멈추지 않도록 보장.

```ts
const weather = await fetchWeather(id) ?? FALLBACK_BEACHES[id].weather
```

---

## 4. BSM 엔진 (`lib/bsm/`)

`design_files/data.js`를 TypeScript로 이식. 함수 시그니처 동일, 내부 구현만 교체.

### 4-1. 수심 프로파일 (`transect.ts`)

기존 `shelf/shelfDepth/slope` 파라미터 방식 → **실제 수심 격자 보간** 방식으로 교체:

```
자연과학용 수심정보 150m 격자
  └─ 해변 좌표 기준 단면선 방향으로 격자 샘플링
  └─ 인접 격자점 선형 보간 → 연속 수심 프로파일
  └─ + 조위 오프셋 가산 → 체감 수심
  └─ levelOf(depth) → 발목/무릎/허리/가슴/머리
```

### 4-2. 체감 수심 단계 (`levels.ts`)

| key | label | 임계 깊이(m) | status |
|---|---|---|---|
| none | 물 없음 | ≤ 0.02 | safe |
| ankle | 발목 | ≥ 0 | safe |
| knee | 무릎 | ≥ 0.3 | safe |
| waist | 허리 | ≥ 0.6 | caution |
| chest | 가슴 | ≥ 1.0 | caution |
| head | 머리 이상 | ≥ 1.5 | danger |

### 4-3. 안전 점수 (`score.ts`)

0–100점, 6개 항목 가중 평균:

| 항목 | 가중치 | 계산 방식 |
|---|---|---|
| 수심 안전성 | 30% | `dangerStart` 거리 길수록 고점 |
| 이안류 | 25% | 관심=90 / 주의=60 / 경계=30 / 위험=0 |
| 파도 | 20% | 파고 0.5m↓=100 / 1m=60 / 1.5m=20 / 2m↑=0 |
| 조위 변화 | 10% | 상승 중 감점 (만조 방향 위험) |
| 날씨 | 10% | 풍속·강수 기반 |
| 수질 | 5% | 적합=100 / 주의=50 / 부적합=0 |

```
score ≥ 70 → 'safe'
score ≥ 40 → 'caution'
score < 40 → 'danger'
```

### 4-4. AI 안전 코멘트 (`aiComment.ts`)

`analyze()` 결과(kneeEnd, dangerStart)로 규칙 기반 2줄 문장 생성. 프로토타입 로직 그대로 이식.

---

## 5. 컴포넌트 구조

### 5-1. 공용 (`components/shared/`)

**CrossSection** (Client Component — 핵심):
```
CrossSection
├── TideTabBar          # 현재/1시간후/2시간후 세그먼트 (42px, flex:1)
├── PlanView            # 평면도 + 단면선 드래그
│   └── DragHandle      # 좌우 화살표 + "단면선" 캡션
├── SectionSVG          # 수직 단면도 (viewBox 0 0 820 300)
│   ├── DepthColumns    # 체감수심 컬럼 (2m 간격)
│   ├── SeabedPath      # 해저선 polyline (#B79B68)
│   ├── SurfaceLine     # 수면선 (#2f86f0)
│   ├── GuideLines      # 발목/무릎/허리/가슴 가이드선
│   ├── DangerMarker    # 위험 시작점 빨강 점선 + 배지
│   └── SafeZoneMarker  # 추천 입수 구간 초록선
├── DepthLegend         # 6단계 컬러 칩 범례
└── AiCommentCard       # 규칙 기반 코멘트 + 출처 푸터
```

CrossSection 로컬 상태:
```ts
const [p, setP] = useState(0.5)           // 단면선 위치 (0.02~0.98)
const [tideKey, setTideKey] = useState<TideKey>('now')
const [isDragging, setIsDragging] = useState(false)
```

기타 공용: `StatusPill`, `ScoreGauge`, `BeachCard`, `WaveLogo`, `WaveWordmark`

### 5-2. 웹 전용 (`components/web/`)

`Sidebar`, `TopHeader`, `HeroCard`, `FeatureRow`, `OceanSafetyPanel`, `ParkingPanel`, `SituationTips`, `TideForecastPanel`

### 5-3. 앱 전용 (`components/app/`)

`BottomTabBar`, `AppHeader`, `AppBeachCard`, `AppOceanPanel`

---

## 6. 디자인 토큰

`styles/tokens.css`에 전체 정의. 프로토타입 `styles.css`에서 그대로 이식.

- 브랜드: `--navy-900 #0A2342`, `--blue-600 #1D6FE0` (주조 액션), `--sky-400 #39B7F0`
- 상태: `--safe #16A34A`, `--caution #EA8C00`, `--danger #DC2626`
- 수심 램프: `--d-none #EAF4FB` → `--d-ankle #BFE3F6` → `--d-knee #7FC6EE` → `--d-waist #3D9FE0` → (가슴/머리 더 진한 블루)
- 중립: `--ink #0F2238`, `--bg #F4F7FB`, `--card #FFFFFF`
- 폰트: Pretendard (본문), Quicksand (WaveCut 워드마크 전용)
- 간격: 4px 베이스, 카드 radius 12px, 컨트롤 8px, 히트 영역 min 44px

---

## 7. 스코프 경계

### MVP 포함
- 웹 대시보드 (`/`) + 해수욕장 상세 + 단면 수심 뷰
- 모바일 앱 (`/app`) + 해수욕장 상세 + 단면 수심 뷰 + 즐겨찾기(빈 상태) + 마이페이지
- 운영자 대시보드 (`/operator`) — 현 프로토타입 수준 유지
- 공공 API 8종 실데이터 연동 + fallback 처리
- Vercel 배포 + QR 코드 접근

### MVP 제외 (향후 확장)
- 3D 파도 안전뷰
- 즐겨찾기 실제 저장 (로컬스토리지/계정)
- GPS/내 위치 기능
- AI-Hub 음성 인식 (STT/위급 신고)
- 알림 (푸시/탭)
- LLM 기반 AI 코멘트

---

## 8. 주의 사항 (표현 가이드)

공공 API는 현장 센서가 아닌 관측·측량·격자 기반 데이터임을 명시:

> "공공 수심 데이터와 조위 데이터를 결합해 사용자가 선택한 단면선의 체감 수심을 **추정**하고 시각화합니다."

> "파랑 격자 데이터와 해수욕장 관측 데이터를 기반으로 구간별 파도 영향도를 **추정**하고 시각화합니다."
