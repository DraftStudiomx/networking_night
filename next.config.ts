import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer ships ESM + node deps that must stay external on the server
  serverExternalPackages: ["@react-pdf/renderer"],
  // the PDF renderer reads these from disk at runtime: our fonts, and pdfkit's built-in
  // Helvetica, which it loads by a computed path the tracer can't follow (on Vercel the
  // file was missing and every PDF failed with "Cannot find module …/Helvetica.cjs")
  outputFileTracingIncludes: {
    "/api/**/*": ["./src/fonts/*.woff", "./node_modules/pdfkit/js/standard-fonts/*.cjs"],
  },
};

export default nextConfig;
