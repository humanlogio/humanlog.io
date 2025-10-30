import { betterAuth } from "better-auth";
import { createSharedBetterAuthConfig } from "@humanlogio/auth-adapter/js/cfg/betterauth/config.ts";
import { getSelfURL } from "@/lib/config/envs";

export const auth = betterAuth(
  createSharedBetterAuthConfig({
    callbacksClient: getSelfURL(),
    createInvitationUrl: (invitationId: string) => {
      // TODO: how to handle this? 🥹
      return "";
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  }),
);
