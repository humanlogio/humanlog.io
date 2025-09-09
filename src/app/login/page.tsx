"use client";

import { useAllEnvironments } from "@/context/list-environments";
import { useQuery } from "@connectrpc/connect-query";
import { whoami } from "api/js/svc/user/v1/service_private-UserService_connectquery";
import { useEffect } from "react";

import { useRouter } from "next/navigation";
import LoadingIndicator from "@/components/loading-indicator";

export default function Login() {
  const router = useRouter();
  const { setUserInfo, localhostInfo, listEnvironments } = useAllEnvironments();
  const { data: userInfo, isFetching } = useQuery(whoami);

  useEffect(() => {
    setUserInfo(userInfo);
    let env;
    if (localhostInfo) {
      env = "localhost";
    } else if (listEnvironments.length > 0) {
      env = listEnvironments[0]?.environment?.name;
    } else {
      env = "localhost";
    }
    userInfo?.currentOrganization?.name &&
      env &&
      router.replace(`/${userInfo?.currentOrganization?.name}/${env}/query`);
  }, [userInfo, localhostInfo]);

  return <LoadingIndicator />;
}
