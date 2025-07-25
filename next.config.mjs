import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { withContentlayer } = require("next-contentlayer2");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // swcMinify: false,
  output: "standalone",
  transpilePackages: ["api"],
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  reactStrictMode: false,
  productionBrowserSourceMaps: true,
  compress: false,

  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,

  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://us.i.posthog.com/decide",
      },
    ];
  },

  webpack: (config, { isServer }) => {
    // Disable all optimizations
    config.optimization = {
      ...config.optimization,
      minimize: false, // Most important!
      minimizer: [],
      sideEffects: false,
      usedExports: false,
      concatenateModules: false,
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          default: false,
          vendors: false,
          // Don't split zustand into separate chunks
          // zustand: false,
        },
      },
    };

    // Disable tree shaking
    config.optimization.providedExports = false;
    config.optimization.usedExports = false;

    // Keep readable names for bundle analysis
    config.optimization.moduleIds = "named";
    config.optimization.chunkIds = "named";

    // Zustand alias configuration
    // config.resolve.alias = {
    //   ...config.resolve.alias,
    //   zustand: require.resolve("zustand"),
    // };

    // Plugin settings for Monaco Editor webpack
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
