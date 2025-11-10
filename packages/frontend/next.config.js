/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // PWA configuration will be added via next-pwa plugin
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig
