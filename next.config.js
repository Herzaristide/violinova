/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development'
});

const withNextIntl = require('next-intl/plugin')('./i18n.ts');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true
  },
  experimental: {
    ppr: true,
    serverActions: true
  }
};

module.exports = withNextIntl(withPWA(nextConfig));
