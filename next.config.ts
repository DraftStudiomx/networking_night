import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer ships ESM + node deps that must stay external on the server
  serverExternalPackages: ["@react-pdf/renderer"],
  // the PDF renderer reads these font files from disk at runtime
  outputFileTracingIncludes: {
    "/api/**": ["./src/fonts/*.woff"],
  },
};

export default nextConfig;
