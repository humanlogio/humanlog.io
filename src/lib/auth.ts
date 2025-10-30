import { betterAuth } from "better-auth";
import { createSharedBetterAuthConfig } from "@humanlogio/auth-adapter/cfg/betterauth/config.js";
import {
  createHMACInterceptor,
  createBetterAuthAdapter,
} from "@humanlogio/auth-adapter/client/betterauth/adapter.js";
import { getAPIURL } from "@/lib/config/envs";
import { BetterAuthCallbacks } from "@humanlogio/auth-adapter/gen/svc/betterauth/v1/callbacks_pb.js";
import { createConnectTransport } from "@connectrpc/connect-web";
import { createClient } from "@connectrpc/connect";
import { BetterAuthAdapter } from "@humanlogio/auth-adapter/gen/svc/betterauth/v1/service_pb.js";

const keystore = {
  getKey: async (keyId: string) => {
    return new Uint8Array(0);
  },
  sign: async (keyId: string, message: string) => {
    return "";
  },
};

const apiTransport = createConnectTransport({
  baseUrl: getAPIURL(),
  interceptors: [createHMACInterceptor(keystore)],
});

const betterAuthAdapterClient = createClient(BetterAuthAdapter, apiTransport);
const betterAuthCallbacksClient = createClient(
  BetterAuthCallbacks,
  apiTransport,
);
const betterAuthAdapter = createBetterAuthAdapter(betterAuthAdapterClient);

export const auth = betterAuth(
  createSharedBetterAuthConfig({
    callbacksClient: betterAuthCallbacksClient,
    createInvitationUrl: (invitationId: string) => {
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
