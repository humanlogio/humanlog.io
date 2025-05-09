import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { withContentlayer } = require("next-contentlayer2");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["api"],
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  reactStrictMode: false,
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: ["@vercel/otel"],
  },

  webpack: (config, { isServer }) => {
    //plugin setting for monaco editor webpack
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
});

export default withContentlayer(withMDX(nextConfig));
