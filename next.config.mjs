/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // El cuaderno y el chat son siempre dinámicos: dependen de la sesión de la abuela.
  experimental: {
    serverActions: { bodySizeLimit: '1mb' },
  },
};

export default nextConfig;
