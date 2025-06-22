/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false, // Disable SWC minification
  experimental: {
    forceSwcTransforms: false, // Disable SWC transforms
  },
  // Use Babel instead of SWC
  compiler: {
    removeConsole: false,
  },
}

module.exports = nextConfig