import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Gambar Cloudinary dimuat lewat `cloudinaryLoader` (src/lib/images.ts),
  // jadi tidak memakai optimizer server dan tidak butuh images.remotePatterns.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
