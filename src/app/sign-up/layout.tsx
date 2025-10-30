"use client";

import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { flagEnabled: isAuthMigrationReady, isLoading } =
    useFeatureFlag("release_auth_temp");

  useEffect(() => {
    if (!isLoading && !isAuthMigrationReady) {
      router.replace("/");
    }
  }, [isLoading, isAuthMigrationReady, router]);

  if (isLoading || !isAuthMigrationReady) return null;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      {children}
    </div>
  );
}
