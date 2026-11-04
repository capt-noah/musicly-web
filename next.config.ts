import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/ios/antirevoke.mobileconfig",
        headers: [
          {
            key: "Content-Type",
            value: "application/x-apple-aspen-config",
          },
          {
            key: "Content-Disposition",
            value: 'attachment; filename="antirevoke.mobileconfig"',
          },
        ],
      },
      {
        source: "/ios/manifest.plist",
        headers: [
          {
            key: "Content-Type",
            value: "application/xml",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
