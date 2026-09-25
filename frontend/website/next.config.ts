import type { NextConfig } from "next";

// Backend routes (/api, /admin/api, /oauth2, /login/oauth2) are proxied by nginx, not Next.
const nextConfig: NextConfig = {
  output: "standalone",
  redirects: async () => [
    { source: "/topics/:categorySlug/:topicPublicUri", destination: "/topics/:topicPublicUri", permanent: true },
  ],
};

export default nextConfig;
