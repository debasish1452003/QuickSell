/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    "localhost:3000",
    "127.0.0.1:3000",
    "192.168.29.130",
    "192.168.29.130:3000",
  ],
};

module.exports = nextConfig;
