const config = {
  TLD: ".io",
  NEXT_IS_PROD: process.env.NEXT_IS_PROD === "true",
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_SELF_BASE_URL: process.env.NEXT_PUBLIC_SELF_BASE_URL,
  NEXT_PUBLIC_DEFAULT_RELEASE_CHANNEL:
    process.env.NEXT_PUBLIC_DEFAULT_RELEASE_CHANNEL,
};

export default config;
