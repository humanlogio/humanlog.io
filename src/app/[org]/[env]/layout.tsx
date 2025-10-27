"use client";

import { NoLocalhostView } from "@/components/log-interface/views/no-localhost-view";
import { useParams, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { usePing } from "@/hooks/usePing";
import { useUser } from "@/hooks/useUser";
import { SideMenu } from "@/app/[org]/[env]/side-menu";

export default function EnvLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const { userData, isLoadingUser } = useUser();
  const { localhostData, isLoadingLocalhost } = usePing();
  const currentEnvSlug = params?.env as string;

  const [isExpanded, setIsExpanded] = useState(false);

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
    <div className="flex w-screen flex-1">
      <SideMenu isExpanded={isExpanded} setIsExpanded={setIsExpanded} />

      <div className={`w-full ${isExpanded ? "ml-35" : "ml-13"}`}>
        {children}
      </div>
    </div>
  );
}
