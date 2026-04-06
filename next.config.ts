// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['img.freepik.com', 'drive.google.com', 'i.pinimg.com', 'files.catbox.moe'],
    // remotePatterns: [new URL('https://img.freepik.com/**')]
  },
  reactStrictMode: false
}

export default nextConfig;