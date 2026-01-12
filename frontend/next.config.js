/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/course-reserv',
  assetPrefix: '/course-reserv',
  images: {
    domains: ['covers.openlibrary.org'],
    unoptimized: true,
  },
}

module.exports = nextConfig
