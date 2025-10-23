"use client";

import { NoLocalhostView } from "@/components/log-interface/views/no-localhost-view";
import { useParams, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { usePing } from "@/hooks/usePing";
import { useUser } from "@/hooks/useUser";

export default function EnvLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const { userData, isLoadingUser } = useUser();
  const { localhostData, isLoadingLocalhost } = usePing();
  const currentEnvSlug = params?.env as string;

  useEffect(() => {
    if (isLoadingUser || userData) return;
    router.replace("/");
  }, [userData, isLoadingUser]);

  if (isLoadingLocalhost) return <></>;

  return !localhostData && currentEnvSlug === "localhost" ? (
    <div className="mt-32 flex justify-center">
      <NoLocalhostView />
    </div>
  ) : (
    children
  );
}
