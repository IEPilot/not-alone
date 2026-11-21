/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  experimental: {
    // pdfkit reads its own data files at runtime, and the PDF route needs the font files.
    serverComponentsExternalPackages: ["pdfkit"],
    outputFileTracingIncludes: { "/book/download": ["./assets/fonts/**/*"] },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
