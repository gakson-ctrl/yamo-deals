const createNextIntlPlugin = require('next-intl/plugin');

// Points at our App Router request config (i18n.ts at project root).
const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = withNextIntl(nextConfig);
