"use client";

import { NoLocalhostView } from "@/components/log-interface/views/no-localhost-view";
import { useParams } from "next/navigation";
import { ReactNode } from "react";
import { usePing } from "@/hooks/usePing";

export default function EnvLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const { localhostData, isLoadingLocalhost } = usePing();
  const currentEnvSlug = params?.env as string;

  if (isLoadingLocalhost) return <></>;

  return !localhostData && currentEnvSlug === "localhost" ? (
    <div className="mt-32 flex justify-center">
      <NoLocalhostView />
    </div>
  ) : (
    children
  );
}
