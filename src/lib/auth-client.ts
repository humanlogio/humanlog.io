import { createAuthClient } from "better-auth/react";
import { getSelfURL } from "@/lib/config/envs";
import { usernameClient, organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: getSelfURL(),
  plugins: [usernameClient(), organizationClient()],
});
