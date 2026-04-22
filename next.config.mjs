/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! คำเตือน: อันนี้คือสั่งให้ข้ามการตรวจ Error ตอน Build !!
    ignoreBuildErrors: true,
  },
};

export default nextConfig;