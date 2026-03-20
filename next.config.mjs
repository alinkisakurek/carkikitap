/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Google Books thumbnails
      { protocol: "https", hostname: "books.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com", pathname: "/**" },
      { protocol: "https", hostname: "encrypted-tbn1.gstatic.com", pathname: "/**" },
      { protocol: "https", hostname: "encrypted-tbn2.gstatic.com", pathname: "/**" },
      { protocol: "https", hostname: "encrypted-tbn3.gstatic.com", pathname: "/**" },
      { protocol: "https", hostname: "encrypted-tbn4.gstatic.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
