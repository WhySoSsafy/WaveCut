This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 실데이터(공공데이터) 연동

현재 공공데이터 키가 없으면 앱은 **FALLBACK(추정/목업) 데이터**로 동작하며,
웹 상단 표시가 "추정 데이터 · 데모"로 바뀝니다. 키를 넣으면 자동으로 실데이터가
흐르고 "실시간"으로 표시됩니다(코드 변경 불필요).

### 1. 키 발급
- **data.go.kr** (기상청 단기예보, 조위, 해수욕장/이안류/수질 등): 공공데이터포털에서
  회원가입 후 해당 API 활용신청 → **Decoding 키** 사용.
- **날씨**(기온·하늘·풍속)는 `DATA_GO_KR_KEY` 로 **실연동 검증 완료**.
- **조위·파고**는 KHOA(바다누리) 자체 키가 필요합니다. 무료로 발급
  (https://www.khoa.go.kr 오픈API) 후 `.env.local`·Vercel 에 `KHOA_API_KEY` 추가하면
  활성화됩니다. 없으면 그 항목만 폴백.
- **수심 단면**: 근접 연안 정밀 수심은 공개 API가 없어 **대표 예시 프로파일**을 사용하며
  화면에 그렇게 명시합니다.
- `KMA_API_KEY` 는 현재 코드에서 사용하지 않습니다.

진단: `node scripts/probe-apis.mjs` 를 wavecut 폴더에서 실행하면 `.env.local` 키로
각 엔드포인트를 실제 호출해 어떤 소스가 실데이터를 주는지 확인합니다(키는 마스킹).

### 2. 로컬 설정
`wavecut/.env.local` 파일을 만들고(`.env.local.example` 참고):

```bash
DATA_GO_KR_KEY=발급받은_디코딩_키
```

`npm run dev` 재시작 후 상단이 "실시간"으로 바뀌면 연동 성공.

### 3. Vercel(배포) 설정
Vercel 프로젝트 → **Settings → Environment Variables** 에 `DATA_GO_KR_KEY` 를
추가하고 **반드시 재배포(redeploy)** 하세요. 환경변수는 재배포해야 적용됩니다.
(키는 절대 리포에 커밋하지 않습니다 — `.env.local` 은 `.gitignore` 처리됨.)

### 동작 방식 메모
- 해변 페이지는 정적 생성 + 페처가 `revalidate: 3600`(1시간) ISR을 사용합니다.
  즉 키를 넣고 재배포하면 **빌드 시점 또는 1시간 내 재검증 때** 실데이터로 채워집니다.
- 각 데이터 소스는 독립적으로 폴백합니다. 특정 API가 승인 대기/스키마 상이/오류면
  그 항목만 추정값으로 표시됩니다. 실패 원인은 **Vercel 함수 로그**에서 확인하세요.
- data.go.kr 은 해외(Vercel) 서버에서도 일반적으로 호출됩니다(국가 차단 아님).

> 교통(부산교통공사) 실연동은 별도 키가 필요해 현재는 목업이며, 화면에 "API 연동 예정"으로
> 명시되어 있습니다. 위치(가까운 해변) 기능은 키 없이 브라우저 위치만으로 동작합니다.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
