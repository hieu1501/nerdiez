import type { NextConfig } from "next";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  redirects: async () => [
    { source: "/topics/:categorySlug/:topicPublicUri", destination: "/topics/:topicPublicUri", permanent: true },
  ],
  rewrites: async () => [
    { source: "/api/:path*", destination: `${apiBaseUrl}/api/:path*` },
    { source: "/admin/api/:path*", destination: `${apiBaseUrl}/admin/api/:path*` },
    { source: "/media/:path*", destination: `${apiBaseUrl}/media/:path*` },
    { source: "/oauth2/:path*", destination: `${apiBaseUrl}/oauth2/:path*` },
  ],
};

export default nextConfig;
