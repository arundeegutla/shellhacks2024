/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
    distDir: 'out', // Where to export all pages
    staticPageGenerationTimeout: 1000,
    reactStrictMode: false,
    trailingSlash: true
}

export default nextConfig;
