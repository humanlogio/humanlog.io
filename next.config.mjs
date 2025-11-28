import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { withContentlayer } = require("next-contentlayer2");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // swcMinify: false,
  output: "standalone",
  transpilePackages: [
    "api",
    "@humanlogio/perses-plugin",
    "@humanlogio/auth-adapter",
  ],
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  reactStrictMode: false,
  experimental: {
    mdxRs: false,
  },

  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,

  async rewrites() {
    return [
      {
        source: "/hlg-telemetry/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/hlg-telemetry/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/hlg-telemetry/decide",
        destination: "https://us.i.posthog.com/decide",
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/docs/:path*",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=0, s-maxage=1200, stale-while-revalidate=3600",
          },
        ],
      },
      {
        source: "/blog/:path*",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=0, s-maxage=1200, stale-while-revalidate=3600",
          },
        ],
      },
      {
        source: "/share/:path*",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=0, s-maxage=1200, stale-while-revalidate=3600",
          },
        ],
      },
    ];
  },

  webpack: (config, { isServer }) => {
    // Disable all optimizations
    config.optimization = {
      ...config.optimization,
      minimize: false, // Most important!
    };

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
