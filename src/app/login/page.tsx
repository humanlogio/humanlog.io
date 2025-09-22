"use client";

import { useAllEnvironments } from "@/context/list-environments";
import { useQuery } from "@connectrpc/connect-query";
import { whoami } from "api/js/svc/user/v1/service_private-UserService_connectquery";
import { useEffect } from "react";

import { useRouter } from "next/navigation";
import LoadingIndicator from "@/components/loading-indicator";
import { useEnvironmentStore } from "@/stores/environment-store";
import { getOrgEnvUrl } from "@/lib/utils/navigation";

export default function Login() {
  const router = useRouter();
  const { setUserInfo, localhostInfo } = useAllEnvironments();
  const { data: userInfo } = useQuery(whoami);
  const { setActiveEnvironment, activeEnvironment } = useEnvironmentStore();

  useEffect(() => {
    setUserInfo(userInfo);
    setActiveEnvironment(undefined);
    const url = getOrgEnvUrl(userInfo, activeEnvironment);
    router.replace(url);
  }, [userInfo, localhostInfo]);

  return <LoadingIndicator />;
}
