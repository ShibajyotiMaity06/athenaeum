/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["highlight.js", "marked", "marked-highlight"],
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "devprep.online"
          }
        ],
        destination: "https://www.devprep.online/:path*",
        permanent: true
      },
      {
        source: "/library",
        destination: "/#technologies",
        permanent: true
      },
      {
        source: "/library/:stack",
        destination: "/:stack-interview-questions",
        permanent: true
      },
      {
        source: "/library/:stack/:level",
        destination: "/:stack-interview-questions/:level",
        permanent: true
      },
      {
        source: "/refund",
        destination: "/cancellation-and-refund",
        permanent: true
      },
      {
        source: "/privacy-policy",
        destination: "/privacy",
        permanent: true
      },
      {
        source: "/terms-and-conditions",
        destination: "/terms",
        permanent: true
      },
      {
        source: "/terms-of-service",
        destination: "/terms",
        permanent: true
      }
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" }
        ]
      }
    ];
  }
};

export default nextConfig;
