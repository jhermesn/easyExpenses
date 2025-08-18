/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
  distDir: 'docs',
  basePath: '/easyExpenses',
  trailingSlash: true,
}

export default nextConfig
