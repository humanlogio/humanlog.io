import { unstable_noStore as noStore } from "next/cache";

export const getAPIURL = (): string => {
  noStore();
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  return "https://api.humanlog.io";
};

export const getSelfURL = (): string => {
  noStore();
  if (process.env.NEXT_PUBLIC_SELF_BASE_URL) {
    return process.env.NEXT_PUBLIC_SELF_BASE_URL;
  }
  return "https://humanlog.io";
};

export const getReleaseChannel = (): string => {
  noStore();
  if (process.env.NEXT_PUBLIC_DEFAULT_RELEASE_CHANNEL) {
    return process.env.NEXT_PUBLIC_DEFAULT_RELEASE_CHANNEL;
  }
  return "main";
};
