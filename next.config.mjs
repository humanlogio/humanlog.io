import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    transpilePackages: ['api'],
    pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
    generateBuildId: async () => {
        return process.env.GIT_HASH
    },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
})

export default withMDX(nextConfig);
