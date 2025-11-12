"use client";

import { EmailSentConfirmation } from "@/components/auth/email-sent-confirmation";
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
    await sendVerificationEmail({
      email,
    });
  };

  if (!email) return null;

  return (
    <EmailSentConfirmation
      title="Verify your email"
      description="Please verify to continue."
      email={email}
      onAction={onSendVerificationEmail}
    />
  );
}
