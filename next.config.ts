import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // MetaApi is a Node.js-only SDK. Keep it external to Next/Turbopack bundles
  // so it never enters the browser graph or Edge runtime.
  serverExternalPackages: ["metaapi.cloud-sdk"],
};

export default nextConfig;
