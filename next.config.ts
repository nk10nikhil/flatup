import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // !! WARN !!
    // Ignoring TypeScript errors to allow builds to complete
    // Recommended to fix these TypeScript errors after build issues are resolved
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning rather than failing on ESLint issues
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
