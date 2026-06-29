import type { Metadata } from "next";
import localFont from "next/font/local";
import { Quicksand } from "next/font/google";
import "@/styles/globals.css";
import { getI18n } from "@/lib/i18n/server";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale, t } = await getI18n();
  return (
    <html
      lang={locale}
      className={`${pretendard.variable} ${quicksand.variable}`}
    >
      <body>
        <LocaleProvider locale={locale} dict={t}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
