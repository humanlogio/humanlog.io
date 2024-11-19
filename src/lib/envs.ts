import { unstable_noStore as noStore } from "next/cache";

export const getAPIURL = (): string => {
  noStore();
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    console.log(
      "api-base-url: using env var",
      process.env.NEXT_PUBLIC_API_BASE_URL,
    );
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  console.log("api-base-url: using default");
  return "https://api.humanlog.io";
};

export const getSelfURL = (): string => {
  noStore();
  if (process.env.NEXT_PUBLIC_SELF_BASE_URL) {
    console.log(
      "self-base-url: using env var",
      process.env.NEXT_PUBLIC_SELF_BASE_URL,
    );
    return process.env.NEXT_PUBLIC_SELF_BASE_URL;
  }
  console.log("self-base-url: using default");
  return "https://humanlog.io";
};

export const getReleaseChannel = (): string => {
  noStore();
  if (process.env.NEXT_PUBLIC_DEFAULT_RELEASE_CHANNEL) {
    console.log(
      "release-channel: using env var",
      process.env.NEXT_PUBLIC_DEFAULT_RELEASE_CHANNEL,
    );
    return process.env.NEXT_PUBLIC_DEFAULT_RELEASE_CHANNEL;
  }
  console.log("release-channel: using default");
  return "main";
};
