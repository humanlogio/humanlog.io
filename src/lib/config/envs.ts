import config from "@/lib/config";
import { unstable_noStore as noStore } from "next/cache";

export const getAPIURL = (): string => {
  noStore();
  if (config.NEXT_PUBLIC_API_BASE_URL) {
    return config.NEXT_PUBLIC_API_BASE_URL;
  }
  return "https://api.humanlog.io";
};

export const getSelfURL = (): string => {
  noStore();
  if (config.NEXT_PUBLIC_SELF_BASE_URL) {
    return config.NEXT_PUBLIC_SELF_BASE_URL;
  }
  return "https://humanlog.io";
};

export const getReleaseChannel = (): string => {
  noStore();
  if (config.NEXT_PUBLIC_DEFAULT_RELEASE_CHANNEL) {
    return config.NEXT_PUBLIC_DEFAULT_RELEASE_CHANNEL;
  }
  return "main";
};
