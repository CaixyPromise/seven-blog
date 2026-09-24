/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
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
