"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function CheckEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const { requestPasswordReset } = authClient;

  const sentEmail = async () => {
    if (!email) {
      toast.error("Email is required");
      return;
    }
    await requestPasswordReset(
      {
        email,
        redirectTo: "/sign-in/reset-password",
      },
      {
        onSuccess: (ctx) => {
          toast.success(
            "Password reset email sent successfully",
            ctx.data.message,
          );
          router.push(`/sign-in/reset-password/check-email?email=${email}`);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    );
  };

  return (
    <div className="flex flex-col items-center justify-center gap-7.5">
      <div className="text-muted-foreground flex flex-col items-center gap-2.5 text-sm">
        <Mail size={32} className="text-neutral-600 dark:text-neutral-400" />
        <h1 className="text-foreground text-xl font-semibold">
          Check your email{" "}
        </h1>
        <p className="text-center">
          Check your email and click the link we sent
          <br /> to reset your password.
        </p>
      </div>

      <Button className="w-full" onClick={() => router.push("/sign-in")}>
        Send me back to sign in
      </Button>

      <div className="flex items-center justify-center">
        <span className="text-sm text-neutral-500">
          Didn&apos;t get the email?
        </span>
        <Button
          onClick={sentEmail}
          variant="link"
          className="text-sm font-normal text-blue-500"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
