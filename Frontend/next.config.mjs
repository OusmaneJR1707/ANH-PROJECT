/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.1.10"],
  async rewrites() {
    return [
      {
        // Qualsiasi chiamata fatta a /api-backend/...
        source: '/api-backend/:path*',
        // Verrà girata in modo invisibile a XAMPP
        destination: 'http://localhost/ANH-PROJECT/API/:path*', 
      },
    ]
  },
}

export default nextConfig;

