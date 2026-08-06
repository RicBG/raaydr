import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app lives inside the raaydr repo for now; pin the workspace root so
  // Next never mistakes the outer project's lockfile for ours.
  turbopack: { root: __dirname },
};

export default nextConfig;
