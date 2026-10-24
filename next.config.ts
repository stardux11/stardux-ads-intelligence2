import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.fbcdn.net" },
      { protocol: "https", hostname: "**.facebook.com" },
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "graph.facebook.com" },
      { protocol: "https", hostname: "scontent.**.fbcdn.net" },
    ],
  },
  async headers() {
    return [
      {
        source: "/api/ad-snapshot",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
