import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

const root = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The panel is opened at 127.0.0.1:3001 locally (so its API cookies don't
  // collide with the student site on localhost); Next 16 only trusts
  // localhost dev origins by default and would block the client bundle.
  allowedDevOrigins: ["127.0.0.1"],
  agentRules: false,
  turbopack: {
    root,
  },
};

export default nextConfig;
