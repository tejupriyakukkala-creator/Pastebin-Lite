/** @type {import('next').NextConfig} */
const backendUrl = process.env.BACKEND_URL;

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    if (!backendUrl) {
      throw new Error(
        "Environment variable BACKEND_URL is required for Next.js API rewrites, but was not defined."
      );
    }
    const cleanUrl = backendUrl.replace(/\/+$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${cleanUrl}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
