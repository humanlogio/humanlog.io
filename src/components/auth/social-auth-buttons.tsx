import { Button } from "@/components/ui/button";
import { GithubIcon, GoogleIcon } from "public/icons";
import { useSocialAuth } from "@/hooks/useSocialAuth";

interface SocialAuthButtonsProps {
  config?: {
    callbackURL?: string;
    errorCallbackURL?: string;
    newUserCallbackURL?: string;
  };
}

export const SocialAuthButtons = ({ config }: SocialAuthButtonsProps) => {
  const { signInWithGoogle, signInWithGithub } = useSocialAuth(config);

  return (
    <div className="flex w-full flex-col gap-5">
      <Button variant="outline" className="h-10" onClick={signInWithGoogle}>
        <GoogleIcon />
        Continue with Gmail
      </Button>
      <Button variant="outline" onClick={signInWithGithub}>
        <GithubIcon />
        Continue with Github
      </Button>
    </div>
  );
};
