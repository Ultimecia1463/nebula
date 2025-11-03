import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "frwc97nbfl.ufs.sh",
        pathname: "/f/*",
      }
    ]
  }
};

export default nextConfig;
