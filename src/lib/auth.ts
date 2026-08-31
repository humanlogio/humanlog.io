import { betterAuth } from "better-auth";
import { createSharedBetterAuthConfig } from "@humanlogio/auth-adapter/cfg/betterauth/config.js";
import {
  createHMACInterceptor,
  createBetterAuthAdapter,
} from "@humanlogio/auth-adapter/client/betterauth/adapter.js";
import { getAPIURL, getSelfURL } from "@/lib/config/envs";
import { BetterAuthCallbacks } from "@humanlogio/auth-adapter/gen/svc/betterauth/v1/callbacks_pb.js";
import { createConnectTransport } from "@connectrpc/connect-web";
import { createClient } from "@connectrpc/connect";
import { BetterAuthAdapter } from "@humanlogio/auth-adapter/gen/svc/betterauth/v1/service_pb.js";
import { JSONKeystore } from "@humanlogio/auth-adapter/util/hmackeystore/json.js";
import { customSession, organization } from "better-auth/plugins";

const keystoreJSON = process.env.INTERNAL_HMAC_KEYSTORE;

const keystore = JSONKeystore.fromJSON(
  keystoreJSON || '{"keys": [],"signing_key_id": ""}',
);

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

const shared = createSharedBetterAuthConfig({
  callbacksClient: betterAuthCallbacksClient,
  createInvitationUrl: (invitationId: string) => {
    return `${getSelfURL()}/invitation-callback?invitationId=${invitationId}`;
  },

  github: {
    clientId: process.env.GITHUB_CLIENT_ID || "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  },
});

const config = {
  database: betterAuthAdapter,
  secret: process.env.BETTER_AUTH_SECRET || "",
  baseURL: getSelfURL(),
  user: {
    deleteUser: {
      enabled: true,
    },
  },

  // telemetry: { enabled: true, debug: true },
  ...shared,

  // humanlog.io is taking a break: https://www.webscale.lol/blog/humanlog-retro
  //
  // These overrides must stay *after* the spread above, and must merge into the
  // shared config rather than replace it, or the callbacks it carries go with
  // them. Disabling email/password closes /api/auth/sign-in/email and
  // /api/auth/sign-up/email; emptying socialProviders removes the GitHub and
  // Google routes, which otherwise auto-create an account for any unknown
  // identity that hits `signIn.social`.
  //
  // The backend refuses account and session creation independently — see the
  // closed-for-break interceptor in apisvc. This is the front door only.
  emailAndPassword: { ...shared.emailAndPassword, enabled: false },
  socialProviders: {},
};

export const auth = betterAuth(config);
