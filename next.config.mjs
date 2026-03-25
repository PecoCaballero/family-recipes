/** @type {import('next').NextConfig} */
const nextConfig = {
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
