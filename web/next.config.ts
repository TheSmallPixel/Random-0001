import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      '@backend': path.resolve(__dirname, '../dist'),
    },
  },
};

export default nextConfig;
