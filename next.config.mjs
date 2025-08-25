/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BASE_PATH: '/easyExpenses',
  },
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
