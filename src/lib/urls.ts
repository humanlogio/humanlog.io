import { unstable_noStore as noStore } from "next/cache";

export const getAPIURL = (): string => {
  noStore();
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    console.log(
      "api-base-url: using env var",
      process.env.NEXT_PUBLIC_SELF_BASE_URL,
    );
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  if (typeof window !== "undefined" && window.location.origin) {
    const origin = URL.parse(window.location.origin);
    console.log(origin);
    console.log("api-base-url: using window", origin);
    return window.location.origin;
  }
  console.log("api-base-url: using default");
  return "https://api.humanlog.dev";
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
  if (typeof window !== "undefined" && window.location.origin) {
    const origin = URL.parse(window.location.origin);
    console.log("self-base-url: using window", origin);
    return window.location.origin;
  }
  console.log("self-base-url: using default");
  return "https://humanlog.dev";
};
