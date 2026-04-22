/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // สั่งให้ข้ามการตรวจ TypeScript Error ตอน Build
    ignoreBuildErrors: true,
  },
  eslint: {
    // สั่งให้ข้ามการตรวจ Linting Error (กฎระเบียบโค้ด)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;