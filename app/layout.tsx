import type { Metadata } from "next";
import "./globals.css";

const githubPagesUrl = "https://weiwei-cup.github.io/last-train-thirteen-station";
const description = "V2.0 规则推理构筑游戏：管理抽牌与弃牌、打出策略牌，调查十二位随机乘客并守住零点后的末班车。";

export const metadata: Metadata = {
  title: "末班车：十三号站 V2.0｜规则推理构筑游戏",
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
