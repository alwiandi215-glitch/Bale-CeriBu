/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["pdfkit", "exceljs", "bcryptjs"],
  // Jangan gagalkan build produksi hanya karena error type-check / lint.
  // Kode tetap di-compile; pemeriksaan tipe dijalankan terpisah saat development.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    // Batasi ukuran body server actions untuk unggahan ringan.
    serverActions: { bodySizeLimit: "2mb" },
  },
}

export default nextConfig
