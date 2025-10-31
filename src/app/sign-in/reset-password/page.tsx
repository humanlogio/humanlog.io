"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import zxcvbn from "zxcvbn";
import EmailVerificationForm from "./email-verification-form";
import ResetPasswordForm from "./reset-password-form";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [isEmailVerified, setIsEmailVerified] = useState(false);

  return (
    <div className="w-[320px]">
      <div className="flex w-full flex-col items-center">
        {isEmailVerified ? (
          <ResetPasswordForm />
        ) : (
          <EmailVerificationForm setIsEmailVerified={setIsEmailVerified} />
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
