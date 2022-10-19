/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    scrollRestoration: true
  },
  images: {
    domains: ['www.dota2.com.cn']
  }
}

module.exports = nextConfig
