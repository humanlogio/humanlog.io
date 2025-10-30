"use client";

import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { ChevronLeft } from "lucide-react";
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
    <div className="relative flex h-full w-full flex-col items-center justify-center">
      <button
        className="text-muted-foreground absolute top-5 left-6 flex items-center gap-1 text-xs"
        onClick={() => router.back()}
      >
        <ChevronLeft size={15} />
        Back
      </button>
      {children}
    </div>
  );
}
