import { authClient } from "@/lib/auth-client";

type SocialProvider = "google" | "github";

interface SocialAuthConfig {
  callbackURL?: string;
  errorCallbackURL?: string;
  newUserCallbackURL?: string;
}

export const useSocialAuth = (config?: SocialAuthConfig) => {
  const { signIn } = authClient;

  const defaultConfig = {
    callbackURL: "/",
    errorCallbackURL: "/sign-up/fail",
    newUserCallbackURL: "/sign-up/success",
    ...config,
  };

  const handleSocialSignIn = async (provider: SocialProvider) => {
    const { data, error } = await signIn.social(
      {
        provider,
        ...defaultConfig,
      },
      {
        onRequest: (ctx) => {
          console.log(`${provider} onRequest:`, ctx);
        },
        onSuccess: (ctx) => {
          console.log(`${provider} onSuccess:`, ctx);
        },
        onError: (ctx) => {
          console.log(`${provider} onError:`, ctx);
        },
      },
    );
    return { data, error };
  };

  return {
    signInWithGoogle: () => handleSocialSignIn("google"),
    signInWithGithub: () => handleSocialSignIn("github"),
  };
};
