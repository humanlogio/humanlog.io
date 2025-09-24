"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Code, ConnectError } from "@connectrpc/connect";
import { useApiClients } from "@/context/api-provider";
import { PingResponse } from "api/js/svc/localhost/v1/service_pb";
import { ListEnvironmentResponse_ListItem } from "api/js/svc/organization/v1/service_pb";
import { Organization } from "api/js/types/v1/organization_pb";
import { Cursor, CursorSchema } from "api/js/types/v1/cursor_pb";
import {
  GetAuthURLRequestSchema,
  LocalhostViaBrowserSchema,
} from "api/js/svc/auth/v1/service_pb";
import { getSelfURL } from "@/lib/envs";
import { usePathname, useRouter } from "next/navigation";
import config from "@/features/config";
import { BinaryOp_Operator, Expr } from "api/js/types/v1/query_pb";
import { AllowedUsageResponse } from "api/js/svc/feature/v1/service_pb";
import { AllowedUsageResponse_LocalhostUsage } from "api/js/svc/feature/v1/service_pb";
import { getAllowedUsage } from "@/services/featureService";
import { LocalhostConfig } from "api/js/types/v1/localhost_config_pb";
import { defaultConfig, getConfig } from "@/services/localhostService";
import {
  WhoamiResponse,
  ListOrganizationResponse_ListItem,
} from "api/js/svc/user/v1/service_private_pb";
import { create } from "@bufbuild/protobuf";
import { useEnvironmentStore } from "@/stores/environment-store";

export type FilterBySymbol = {
  symbolName: Expr;
  symbolValue: Expr;
  op?: BinaryOp_Operator;
};

export type UserInfo = WhoamiResponse | "isLoading" | undefined;

type AllEnvironments = {
  userInfo: UserInfo;
  localhostInfo: PingResponse | undefined;
  listEnvironments: ListEnvironmentResponse_ListItem[];
  listOrganizations: ListOrganizationResponse_ListItem[];
  doLogin: (username: string, returnUrl?: string) => void;
  doLogout: () => void;
  setUserInfo: (userInfo: UserInfo) => void;
  getUserInfo: () => void;
  filterBySymbol: FilterBySymbol | null;
  onClickFilterBy: (
    symbolName: Expr,
    symbolValue: Expr,
    op?: BinaryOp_Operator,
  ) => void;
  allowedUsage: AllowedUsageResponse_LocalhostUsage | null;
  handleAllowedUsage: () => void;
  localhostConfig: LocalhostConfig | null;
};

const ListEnvironmentContext = createContext<AllEnvironments>({
  userInfo: "isLoading",
  localhostInfo: undefined,
  listEnvironments: [],
  listOrganizations: [],
  doLogin: () => {},
  doLogout: () => {},
  setUserInfo: () => {},
  getUserInfo: () => {},
  filterBySymbol: null,
  onClickFilterBy: () => {},
  allowedUsage: null,
  handleAllowedUsage: () => {},
  localhostConfig: null,
});

export function ListEnvironmentsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const loginReturnToURL = `${getSelfURL()}/login`;
  const logoutReturnToURL = `${getSelfURL()}/logout`;
  const { apiClients } = useApiClients();

  const { setActiveEnvironment } = useEnvironmentStore();

  const [localhostValid, setLocalhostValid] = useState(false);
  const [localhostInfo, setLocalhostInfo] = useState<PingResponse>();
  const [userInfo, setUserInfo] = useState<UserInfo>("isLoading");
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [listEnvironments, setListEnvironments] = useState<
    ListEnvironmentResponse_ListItem[]
  >([]);
  const [listOrganizations, setListOrganizations] = useState<
    ListOrganizationResponse_ListItem[]
  >([]);
  const [environmentPage, setEnvironmentPage] = useState<Cursor>(
    create(CursorSchema),
  );
  const [filterBySymbol, setFilterBySymbol] = useState<FilterBySymbol | null>(
    null,
  );
  const [allowedUsage, setAllowedUsage] =
    useState<AllowedUsageResponse_LocalhostUsage | null>(null);
  const [localhostConfig, setLocalhostConfig] =
    useState<LocalhostConfig | null>(null);

  const deleteCookie = () => {
    document.cookie = `hlog_session=; path=/; domain=.humanlog${config.TLD}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  };

  const checkLocalhost = async () => {
    try {
      const res = await apiClients?.localhost.ping({});
      if (!res) {
        setLocalhostValid(false);
        return;
      }
      setLocalhostInfo(res);
      setLocalhostValid(true);

      return res;
    } catch (err) {
      setLocalhostValid(false);
      if (err instanceof ConnectError) {
        console.log("localhost isn't running humanlog");
      } else {
        console.error(err);
      }
      setLocalhostInfo(undefined);
    }
  };

  const doLogin = async (username: string, returnUrl?: string) => {
    try {
      const req = create(GetAuthURLRequestSchema, {
        returnToUrl: returnUrl || loginReturnToURL,
        username,
      });
      const res = await apiClients?.auth.getAuthURL(req);
      if (res) {
        router.push(res.authUrl);
      }
    } catch (error) {
      console.log("failed to Login at the browser", error);
    }
  };

  const doLogout = async () => {
    deleteCookie();
    localStorage.removeItem("hlog_session");
    setUserInfo(undefined);
    setActiveEnvironment(undefined);

    try {
      if (!apiClients || userInfo === "isLoading") return;

      const { logoutUrl } = await apiClients.user.getLogoutURL({
        returnTo: logoutReturnToURL,
      });

      router.push(logoutUrl);
    } catch (error) {
      console.error("Failed to get logout URL:", error);
    }
  };

  const getUserInfo = async () => {
    try {
      const res = await apiClients?.user.whoami({});
      if (res && res.user) {
        setUserInfo(res);
        handleAllowedUsage();
        return res;
      }
    } catch (err) {
      deleteCookie();
      setUserInfo(undefined);
      setActiveEnvironment(undefined);
      router.push("/");
    }
  };

  const handleAllowedUsage = async () => {
    if (!apiClients || !userInfo) return;
    await getAllowedUsage(apiClients.feature, {
      onSuccess: (res: AllowedUsageResponse) => {
        setAllowedUsage(res.localhostUsage);
      },
      onError: (err) => {
        console.error(err);
      },
    });
  };

  const onClickFilterBy = (
    symbolName: Expr,
    symbolValue: Expr,
    op?: BinaryOp_Operator,
  ) => {
    setFilterBySymbol({ symbolName, symbolValue, op });
  };

  const getOrganizations = async () => {
    if (!apiClients) return;
    const orgs = await apiClients.user.listOrganization({});
    setListOrganizations(orgs.items);
  };

  useEffect(() => {
    getOrganizations();
  }, [apiClients?.user]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClients?.org.listEnvironment({
          cursor: environmentPage,
          limit: 10,
        });
        if (!res || !res.items) {
          setListEnvironments([]);
          setActiveEnvironment(undefined);
          return;
        }
        setListEnvironments(res.items);
      } catch (err) {
        if (err instanceof ConnectError && err.code == Code.Unauthenticated) {
          console.log("need to auth");
        } else {
          console.error(err);
        }
      }
    })();
  }, [apiClients?.org, currentOrg, environmentPage, setActiveEnvironment]);

  const getLocalhostConfig = () => {
    if (!apiClients) return;
    getConfig(apiClients.localhost, {
      onSuccess: (res) => setLocalhostConfig(res.config ?? defaultConfig),
      onError: (err) => setLocalhostConfig(defaultConfig),
    });
  };

  useEffect(() => {
    // Initial execution
    checkLocalhost();
    getUserInfo();
    const checkLocalhostIntervalId = setInterval(checkLocalhost, 5000); // 5s
    return () => {
      clearInterval(checkLocalhostIntervalId);
    };
  }, []);

  useEffect(() => {
    getLocalhostConfig();
  }, [localhostValid]);

  return (
    <ListEnvironmentContext.Provider
      value={{
        localhostInfo,
        userInfo,
        setUserInfo,
        getUserInfo,
        listEnvironments,
        listOrganizations,
        doLogin,
        doLogout,
        filterBySymbol,
        onClickFilterBy,
        allowedUsage,
        handleAllowedUsage,
        localhostConfig,
      }}
    >
      {children}
    </ListEnvironmentContext.Provider>
  );
}

export function useAllEnvironments(): AllEnvironments {
  return useContext(ListEnvironmentContext)!;
}
