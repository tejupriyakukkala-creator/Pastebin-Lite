/** @type {import('next').NextConfig} */
const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:5000";

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    if (!backendUrl) {
      console.warn(
        "\n[WARNING] Environment variable BACKEND_URL is not defined.\nAPI rewrites from /api/* will be disabled until BACKEND_URL is configured in your deployment environment.\n"
      );
      return [];
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
