// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['img.freepik.com', 'drive.google.com'],
    // remotePatterns: [new URL('https://img.freepik.com/**')]
  },
  reactStrictMode: false
}

export default nextConfig;