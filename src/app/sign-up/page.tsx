"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { GithubIcon, GoogleIcon } from "public/icons";

export default function SignUpPage() {
  const router = useRouter();

  return (
    <div className="w-[320px]">
      <div className="flex w-full flex-col items-center">
        <h1 className="text-xl font-semibold">Create your account</h1>
        <div className="mt-12 flex w-full flex-col gap-5">
          <Button variant="outline" className="h-10">
            <GoogleIcon />
            Continue with Gmail
          </Button>
          <Button variant="outline">
            <GithubIcon />
            Continue with Github
          </Button>
        </div>
        <div className="my-8 flex w-full items-center justify-center">
          <Separator className="flex-1" />
          <span className="text-muted-foreground mx-3 text-sm">or</span>
          <Separator className="flex-1" />
        </div>
        <Button
          className="w-full"
          onClick={() => router.push("/sign-up/email")}
        >
          Continue with Email
        </Button>

        <div className="mt-15 flex items-center justify-center">
          <span className="text-sm text-neutral-500">
            Already have an account?
          </span>
          <Button variant="link" className="text-sm font-normal text-blue-500">
            Sign in
          </Button>
        </div>
      </div>
    </div>
  );
}
