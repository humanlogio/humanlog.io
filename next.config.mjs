/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    transpilePackages: ['api'],
    generateBuildId: async () => {
        return process.env.GIT_HASH
    },
};

export default nextConfig;
