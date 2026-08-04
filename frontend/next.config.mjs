/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/blog/:postSlug.md",
        destination: "/blog-md/:postSlug",
      },
    ]
  },
}

export default nextConfig
