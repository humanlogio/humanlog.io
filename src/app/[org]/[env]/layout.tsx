"use client";

import { NoLocalhostView } from "@/components/log-interface/views/no-localhost-view";
import { useParams, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { usePing } from "@/hooks/usePing";
import { SideMenu } from "@/app/[org]/[env]/side-menu";
import { authClient } from "@/lib/auth-client";
import { useEnvironmentStore } from "@/stores/environment-store";
import { usePageStore } from "@/stores/page-store";
import { getOrgEnvUrl } from "@/lib/utils";
import { CursorSchema } from "api/js/types/v1/cursor_pb";
import { create } from "@bufbuild/protobuf";
import { useQuery } from "@connectrpc/connect-query";
import { listEnvironment } from "api/js/svc/organization/v1/service-OrganizationService_connectquery";

export default function EnvLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const { useSession } = authClient;
  const { useActiveOrganization } = authClient;
  const { data: activeOrganization } = useActiveOrganization();
  const { setActiveEnvironment, activeEnvironment } = useEnvironmentStore();
  const { activePage } = usePageStore();
  const { data: session, isPending: isPendingSession } = useSession();
  const user = session?.user;
  const currentEnvSlug = params?.env as string;
  const checkPing =
    activeEnvironment?.type === "localhost" || currentEnvSlug === "localhost";

  const { localhostData, isLoadingLocalhost, isErrorLocalhost } = usePing();

  const [isExpanded, setIsExpanded] = useState(false);

  const { data: listEnvironmentData, isPending: isPendingListEnvironment } =
    useQuery(listEnvironment, {
      cursor: create(CursorSchema),
      limit: 100,
    });

  useEffect(() => {
    if (isPendingSession || user) return;
    router.replace("/");
  }, [user, isPendingSession]);

  useEffect(() => {
    if (!activeOrganization || isPendingListEnvironment) return;

    if (localhostData && currentEnvSlug === "localhost") {
      setActiveEnvironment({ type: "localhost", data: localhostData });
      const url = getOrgEnvUrl(
        activeOrganization,
        { type: "localhost", data: localhostData },
        activePage,
      );
      router.replace(url);
      return;
    }

    const activeEnv = listEnvironmentData?.items[0];
    if (activeEnv) {
      setActiveEnvironment({ type: "hosted", data: activeEnv });
      const url = getOrgEnvUrl(
        activeOrganization,
        { type: "hosted", data: activeEnv },
        activePage,
      );
      router.replace(url);
      return;
    }
    setActiveEnvironment(undefined);
    router.replace(
      `/${activeOrganization.slug}/localhost/${activePage || "query"}`,
    );
  }, [activeOrganization]);

  if (checkPing && isLoadingLocalhost) return <></>;

  return isErrorLocalhost && currentEnvSlug === "localhost" ? (
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
