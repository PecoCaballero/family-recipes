/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.immediate.co.uk',
        port: '',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/recipes', // Matched parameters can be used in the destination
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
