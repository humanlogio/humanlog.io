import { betterAuth } from "better-auth";
import { createSharedBetterAuthConfig } from "@humanlogio/auth-adapter/cfg/betterauth/config.js";
import { getSelfURL } from "@/lib/config/envs";
import { create } from "@bufbuild/protobuf";
import {
  SendOrganizationInviteResponseSchema,
  SendOTPResponseSchema,
  SendPasswordResetEmailResponseSchema,
  SendVerificationEmailResponseSchema,
  SendVerificationOTPResponseSchema,
} from "@humanlogio/auth-adapter/gen/svc/betterauth/v1/callbacks_pb.js";

export const auth = betterAuth(
  // TODO: how to handle these? 🥹

  createSharedBetterAuthConfig({
    callbacksClient: {
      sendPasswordResetEmail: async (req) => {
        return create(SendPasswordResetEmailResponseSchema);
      },
      sendVerificationEmail: async (req) => {
        return create(SendVerificationEmailResponseSchema);
      },
      sendVerificationOTP: async (req) => {
        return create(SendVerificationOTPResponseSchema);
      },
      sendOTP: async (req) => {
        return create(SendOTPResponseSchema);
      },
      sendOrganizationInvite: async (req) => {
        return create(SendOrganizationInviteResponseSchema);
      },
    },
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
