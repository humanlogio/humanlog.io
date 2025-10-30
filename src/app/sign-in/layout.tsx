"use client";

import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const isAuthMirgrationReady = useFeatureFlag("release_auth_temp");

  useEffect(() => {
    if (!isAuthMirgrationReady) {
      router.replace("/");
    }
  }, [isAuthMirgrationReady, router]);

  if (!isAuthMirgrationReady) {
    return null;
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      {children}
    </div>
  );
}
