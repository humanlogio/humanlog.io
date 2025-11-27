"use client";

import { NoLocalhostView } from "@/components/log-interface/views/no-localhost-view";
import { useParams, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { usePing } from "@/hooks/usePing";
import { SideMenu } from "@/app/[org]/[env]/side-menu";
import { authClient } from "@/lib/auth-client";

export default function EnvLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const { useSession } = authClient;
  const { data: session, isPending: isPendingSession } = useSession();
  const user = session?.user;

  const { localhostData, isLoadingLocalhost } = usePing();
  const currentEnvSlug = params?.env as string;

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (user) return;
    router.replace("/");
  }, [user]);

  useEffect(() => {
    if (isPendingSession || user) return;
    router.replace("/");
  }, [user, isPendingSession]);

  if (isLoadingLocalhost) return <></>;

  return !localhostData && currentEnvSlug === "localhost" ? (
    <div className="mt-32 flex justify-center">
      <NoLocalhostView />
    </div>
  ) : (
    <div className="flex w-screen flex-1">
      <SideMenu isExpanded={isExpanded} setIsExpanded={setIsExpanded} />

      <div
        className={` ${
          isExpanded
            ? "ml-35 w-[calc(100vw-8.75rem)]"
            : "ml-13 w-[calc(100vw-3.25rem)] md:ml-35 md:w-[calc(100vw-8.75rem)]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
