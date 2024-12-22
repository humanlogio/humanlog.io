import testConfig from "@/features/config.test";
import devConfig from "@/features/config.development";
import prodConfig from "@/features/config.production";

const environment: "test" | "development" | "production" =
  process.env.NODE_ENV || "development";

const config = {
  test: testConfig,
  development: devConfig,
  production: prodConfig,
}[environment];

export default config;
