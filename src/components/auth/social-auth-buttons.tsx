import { Button } from "@/components/ui/button";
import { GithubIcon, GoogleIcon } from "public/icons";
import { useSocialAuth } from "@/hooks/useSocialAuth";
import { useTheme } from "next-themes";

interface SocialAuthButtonsProps {
  className?: string;
  config?: {
    callbackURL?: string;
    errorCallbackURL?: string;
    newUserCallbackURL?: string;
  };
}

export const SocialAuthButtons = ({
  className,
  config,
}: SocialAuthButtonsProps) => {
  const { theme } = useTheme();
  const isDarkMode =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : theme === "dark";
  const { signInWithGoogle, signInWithGithub } = useSocialAuth(config);

  return (
    <div className={`flex w-full flex-col gap-5 ${className}`}>
      <Button
        variant="outline"
        className="h-10 w-full"
        onClick={signInWithGoogle}
      >
        <GoogleIcon />
        Continue with Gmail
      </Button>
      <Button
        variant="outline"
        className="h-10 w-full"
        onClick={signInWithGithub}
      >
        <GithubIcon fill={isDarkMode ? "#FAFAFA" : "#0A0A0A"} />
        Continue with Github
      </Button>
    </div>
  );
};
