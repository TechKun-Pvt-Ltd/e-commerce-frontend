// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // `images.domains` is deprecated; use `remotePatterns` instead.
    remotePatterns: [
      { protocol: 'https', hostname: 'img.freepik.com' },
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: 'i.pinimg.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Legacy images (older data) may still reference Catbox URLs.
      { protocol: 'https', hostname: 'files.catbox.moe' },
    ],
  },
  reactStrictMode: false,

  // Fix Turbopack/Next picking wrong root due to extra lockfiles.
  // (Your logs show it selecting `C:\Users\Admin\package-lock.json` as root.)
  outputFileTracingRoot: __dirname,
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig;