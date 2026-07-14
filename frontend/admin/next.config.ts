import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/oauth2/authorization/:path*",
        destination: "http://localhost:8080/oauth2/authorization/:path*",
      },
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
      {
        source: "/admin/api/:path*",
        destination: "http://localhost:8080/admin/api/:path*",
      },
      {
        source: "/login/oauth2/code/:path*",
        destination: "http://localhost:8080/login/oauth2/code/:path*",
      },
      {
        source: "/oauth2/:path*",
        destination: "http://localhost:8080/oauth2/:path*",
      },
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
