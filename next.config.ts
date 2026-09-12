// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'www.canvasia.com.tr' },
      { protocol: 'https', hostname: 'canvasia.com.tr' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'files.catbox.moe' },
      { protocol: 'https', hostname: 'img.freepik.com' },
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: 'i.pinimg.com' },
      { protocol: 'https', hostname: 'pub-c636ad631f4e47d4b7eed2b5fd4f35e6.r2.dev' },
      { protocol: 'http', hostname: 'localhost', port: '8080' },
    ],
    minimumCacheTTL: 2678400, // 31 days CDN cache at Vercel Edge
  },
  reactStrictMode: false,
}

export default nextConfig;
