"use client";

import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function SignUpWithEmailVerifyPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  return (
    <>
      <div className="text-muted-foreground flex w-[207px] flex-col items-center gap-2.5 text-sm">
        <Mail size={32} className="text-neutral-400" />
        <h1 className="text-foreground text-xl font-semibold">
          Verify your email
        </h1>
        <div className="flex flex-col items-center">
          <p>We've sent a verification link to</p>
          {email && <p className="text-foreground">{email}</p>}
        </div>
        <p>Please verify to continue.</p>
      </div>
      <div className="mt-15 flex items-center justify-center">
        <span className="text-sm text-neutral-500">
          Didn&apos;t get the email?
        </span>
        <Button variant="link" className="text-sm font-normal text-blue-500">
          Try again
        </Button>
      </div>
    </>
  );
}
