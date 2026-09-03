import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.rebrickable.com", pathname: "/media/sets/**" },
      { protocol: "https", hostname: "ksszeyuexjevsvbiubvy.supabase.co", pathname: "/storage/v1/object/public/Asset-images/**" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/sell/create",
        has: [{ type: "query", key: "source", value: "manual" }],
        destination: "/sell/atlas",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
