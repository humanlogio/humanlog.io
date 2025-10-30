"use client";

import { Button } from "@/components/ui/button";
import { CircleAlert } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignUpSuccessPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center gap-3">
      <CircleAlert size={32} className="text-neutral-400" />
      <p className="text-center text-xl font-semibold">
        Oops! Something went wrong.
        <br /> Please try again.
      </p>
      <Button
        variant="outline"
        className="mt-4"
        onClick={() => router.push("/sign-up")}
      >
        Try Again
      </Button>
    </div>
  );
}
