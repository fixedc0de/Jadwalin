// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ React 18 compatibility
  reactStrictMode: true,
  
  // ✅ Optimasi images untuk static export / Vercel
  images: {
    unoptimized: true,
  },
  
  // ✅ Suppress warning tentang swcMinify (opsional)
  swcMinify: true,
  
  // ❌ HAPUS: allowedDevOrigins & turbopack (hanya untuk Next.js 15+)
};

module.exports = nextConfig;