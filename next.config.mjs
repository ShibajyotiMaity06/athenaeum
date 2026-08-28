/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
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
