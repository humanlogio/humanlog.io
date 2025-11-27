"use client";

import { ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "public/icons";

export default function ResetPasswordSuccessPage() {
  const router = useRouter();
  return (
    <div className="flex w-[320px] flex-col items-center gap-2">
      <CheckIcon width="32" height="32" />
      <p className="text-center text-xl font-semibold">
        Password updated successfully.
      </p>
      <button
        className="mt-2 flex gap-2 text-sm"
        onClick={() => router.push("/sign-in")}
      >
        Sign In Now
        <ArrowRightIcon width="16" height="16" />
      </button>
    </div>
  );
}
