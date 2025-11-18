"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function SignUpWithEmailVerifyPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const { sendVerificationEmail } = authClient;

  const onSendVerificationEmail = async () => {
    if (!email) return;
    await sendVerificationEmail(
      {
        email,
        callbackURL: "/sign-up/success",
      },
      {
        onSuccess: (ctx) => {
          toast.success(ctx.data.message);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    );
  };

  if (!email) return null;

  return (
    <>
      <div className="text-muted-foreground flex flex-col items-center gap-2.5 text-sm">
        <Mail size={32} className="text-neutral-600 dark:text-neutral-400" />
        <h1 className="text-foreground text-xl font-semibold">
          Verify your email
        </h1>
        <div className="flex flex-col items-center">
          <p>We&apos;ve sent a verification link to</p>
          {email && <p className="text-foreground">{email}</p>}
        </div>
        <p>Please verify to continue.</p>
      </div>
      <div className="mt-15 flex items-center justify-center">
        <span className="text-sm text-neutral-500">
          Didn&apos;t get the email?
        </span>
        <Button
          onClick={onSendVerificationEmail}
          variant="link"
          className="text-sm font-normal text-blue-500"
        >
          Try again
        </Button>
      </div>
    </>
  );
}
