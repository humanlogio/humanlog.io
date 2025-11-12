"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import EmailVerificationForm from "@/app/sign-in/reset-password/email-verification-form";
import ResetPasswordForm from "@/app/sign-in/reset-password/reset-password-form";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="w-[320px]">
      <div className="flex w-full flex-col items-center">
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <EmailVerificationForm />
        )}

        <div className="mt-6 flex items-center justify-center">
          <span className="text-sm text-neutral-500">
            Remembered your password?
          </span>
          <Button
            variant="link"
            className="text-sm font-normal text-blue-500"
            onClick={() => router.push("/sign-in")}
          >
            Sign in
          </Button>
        </div>
      </div>
    </div>
  );
}
