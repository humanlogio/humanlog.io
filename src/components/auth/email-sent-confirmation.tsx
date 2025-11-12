"use client";

import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

interface EmailSentConfirmationProps {
  title: string;
  email: string;
  description: string;
  actionLabel?: string;
  actionText?: string;
  onAction: () => void;
}

export function EmailSentConfirmation({
  title,
  email,
  description,
  actionLabel = "Didn't get the email?",
  actionText = "Try again",
  onAction,
}: EmailSentConfirmationProps) {
  return (
    <>
      <div className="text-muted-foreground flex flex-col items-center gap-2.5 text-sm">
        <Mail size={32} className="text-neutral-400" />
        <h1 className="text-foreground text-xl font-semibold">{title}</h1>
        <div className="flex flex-col items-center">
          <p>We&apos;ve sent a verification link to</p>
          {email && <p className="text-foreground">{email}</p>}
        </div>
        <p>{description}</p>
      </div>
      <div className="mt-15 flex items-center justify-center">
        <span className="text-sm text-neutral-500">{actionLabel}</span>
        <Button
          onClick={onAction}
          variant="link"
          className="text-sm font-normal text-blue-500"
        >
          {actionText}
        </Button>
      </div>
    </>
  );
}
