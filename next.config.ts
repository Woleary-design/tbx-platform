import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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