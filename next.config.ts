import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets devices on the local network (e.g. testing on a phone via
  // http://<lan-ip>:3000) load dev-mode resources like HMR, which Next.js
  // blocks from unrecognized origins by default.
  allowedDevOrigins: ["192.168.0.4"],
};

export default nextConfig;
