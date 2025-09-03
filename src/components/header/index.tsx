"use client";

import { useAllEnvironments } from "@/context/list-environments";
import { useQuery } from "@connectrpc/connect-query";
import { whoami } from "api/js/svc/user/v1/service_private-UserService_connectquery";
import { AppHeader } from "./app-header";
import { PageHeader } from "./page-header";

export const Header = () => {
  const { userInfo } = useAllEnvironments();

  return userInfo ? <AppHeader userInfo={userInfo} /> : <PageHeader />;
};
