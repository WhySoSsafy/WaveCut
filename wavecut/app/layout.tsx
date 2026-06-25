import type { Metadata } from "next";
import localFont from "next/font/local";
import { Quicksand } from "next/font/google";
import "@/styles/globals.css";

const pretendard = localFont({
  src: "../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
});
const quicksand = Quicksand({
  subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "웨이브컷 WaveCut — 해수욕장 안전 서비스",
  description: "부산 해수욕장 단면 수심·안전 정보",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${quicksand.variable}`}>
      <body>{children}</body>
    </html>
  );
}
