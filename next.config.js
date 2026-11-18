/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    scrollRestoration: true
  },
  images: {
    qualities: [50, 75]
  }
}

module.exports = nextConfig
