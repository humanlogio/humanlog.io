import testConfig from "@/lib/config/config.test";
import devConfig from "@/lib/config/config.development";
import prodConfig from "@/lib/config/config.production";

const environment: "test" | "development" | "production" =
  process.env.NODE_ENV || "development";

const config = {
  test: testConfig,
  development: devConfig,
  production: prodConfig,
}[environment];

export default config;
