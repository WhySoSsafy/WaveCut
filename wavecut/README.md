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
- **data.go.kr** (국립해양조사원 조위, 해수욕장/이안류/수질 등): 공공데이터포털에서
  회원가입 후 해당 API 활용신청 → **Decoding 키** 사용.
- **기상청(KMA)** 단기예보: data.go.kr 또는 KMA API 허브에서 키 발급.

### 2. 로컬 설정
`wavecut/.env.local` 파일을 만들고(`.env.local.example` 참고):

```bash
DATA_GO_KR_KEY=발급받은_디코딩_키
KMA_API_KEY=발급받은_키
```

`npm run dev` 재시작 후 상단이 "실시간"으로 바뀌면 연동 성공.

### 3. Vercel(배포) 설정
Vercel 프로젝트 → **Settings → Environment Variables** 에 `DATA_GO_KR_KEY`,
`KMA_API_KEY` 를 추가하고 재배포(redeploy)하세요. (키는 절대 리포에 커밋하지 않습니다 —
`.env.local` 은 `.gitignore` 처리됨.)

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
