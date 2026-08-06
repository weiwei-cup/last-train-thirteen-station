import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(isGitHubPages
    ? {
        output: "export" as const,
        basePath: "/last-train-thirteen-station",
        assetPrefix: "/last-train-thirteen-station",
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
