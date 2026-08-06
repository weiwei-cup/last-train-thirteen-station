import type { Metadata } from "next";
import "./globals.css";

const githubPagesUrl = "https://weiwei-cup.github.io/last-train-thirteen-station";
const description = "V2.5 动态闸机令：在十八次处置中管理调查牌组，应对每位乘客独立变化的通行条件与三级复核。";

export const metadata: Metadata = {
  title: "末班车：十三号站 V2.5｜动态闸机令",
  description,
  metadataBase: new URL(githubPagesUrl),
  openGraph: {
    title: "末班车：十三号站",
    description,
    type: "website",
    locale: "zh_CN",
    url: githubPagesUrl,
    images: [{ url: `${githubPagesUrl}/og.jpg`, width: 1792, height: 928, alt: "末班车：十三号站游戏封面" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "末班车：十三号站",
    description,
    images: [`${githubPagesUrl}/og.jpg`],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
