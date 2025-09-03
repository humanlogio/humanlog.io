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
import { WhoamiResponse } from "api/js/svc/user/v1/service_private_pb";
import { create } from "@bufbuild/protobuf";

export type FilterBySymbol = {
  symbolName: Expr;
  symbolValue: Expr;
  op?: BinaryOp_Operator;
};

type AllEnvironments = {
  userInfo: WhoamiResponse | undefined;
  localhostInfo: PingResponse | undefined;
  listEnvironments: ListEnvironmentResponse_ListItem[];
  doLogin: (returnUrl?: string) => void;
  doLogout: () => void;
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
  userInfo: undefined,
  localhostInfo: undefined,

  listEnvironments: [],
  doLogin: () => {},
  doLogout: () => {},
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
  const returnToURL = `${getSelfURL()}${pathname}`;
  const { apiClients, setActiveEnvironment } = useApiClients();
  const [browserValid, setBrowserValid] = useState(false);
  const [localhostValid, setLocalhostValid] = useState(false);
  const [localhostInfo, setLocalhostInfo] = useState<PingResponse>();
  const [userInfo, setUserInfo] = useState<WhoamiResponse | undefined>(
    undefined,
  );
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [defaultOrg, setDefaultOrg] = useState<Organization | null>(null);
  const [listEnvironments, setListEnvironments] = useState<
    ListEnvironmentResponse_ListItem[]
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

  const checkBrowser = async () => {
    try {
      const res = await apiClients?.user.whoami({});
      if (res && res.user) {
        setBrowserValid(true);
        setUserInfo(res);
        return res;
      }
    } catch (err) {
      document.cookie = `hlog_session=; path=/; domain=.humanlog${config.TLD}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      setBrowserValid(false);
      setUserInfo(undefined);
      // getRefreshToken();
    }
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

  const doBrowserLogin = async (returnUrl: string) => {
    try {
      const req = create(GetAuthURLRequestSchema, { returnToUrl: returnUrl });
      if (localhostInfo?.meta) {
        req.localhost = create(LocalhostViaBrowserSchema, {
          architecture: localhostInfo.architecture,
          operatingSystem: localhostInfo.operatingSystem,
          usingVersion: localhostInfo.clientVersion,
        });
      }
      const res = await apiClients?.auth.getAuthURL(req);

      if (res) {
        router.push(res.authUrl);
      }
    } catch (error) {
      console.log("failed to Login at the browser", error);
    }
  };

  const doLocalhostLogin = async (returnUrl: string) => {
    try {
      await apiClients?.localhost.doLogin({ returnToURL: returnUrl });
    } catch (error) {
      console.log("failed to Login at the cli", error);
    }
  };

  const doLogin = async (returnUrl?: string) => {
    if (browserValid && localhostValid) {
      return;
    }
    if (localhostValid && !localhostInfo?.loggedInUser) {
      doLocalhostLogin(returnUrl ?? returnToURL);
      getUserInfo();
      return;
    }
    if (!browserValid) {
      doBrowserLogin(returnUrl ?? returnToURL);
      getUserInfo();
      return;
    }
  };

  const doLogout = async () => {
    deleteCookie();
    localStorage.removeItem("hlog_session");
    try {
      if (!apiClients) return;

      if (!localhostValid) {
        const { logoutUrl } = await apiClients.user.getLogoutURL({
          returnTo: returnToURL,
        });
        router.push(logoutUrl);
      }

      apiClients?.localhost.doLogout({ returnToURL });
    } catch (error) {
      console.error("Failed to get logout URL:", error);
      // router.push("/login");
    }
  };

  const getUserInfo = async () => {
    if (localhostValid) {
      const localhostAuthRes = await checkLocalhost();

      const req = create(GetAuthURLRequestSchema, { returnToUrl: returnToURL });
      if (localhostAuthRes?.meta) {
        req.localhost = create(LocalhostViaBrowserSchema, {
          architecture: localhostAuthRes.architecture,
          operatingSystem: localhostAuthRes.operatingSystem,
          usingVersion: localhostAuthRes.clientVersion,
        });
      }

      if (localhostAuthRes?.loggedInUser) {
        const { currentOrganization, defaultOrganization } =
          localhostAuthRes.loggedInUser;
        setCurrentOrg(currentOrganization ?? null);
        setDefaultOrg(defaultOrganization ?? null);
      }
    }
    if (browserValid) {
      const browserAuthRes = await checkBrowser();
      setUserInfo(browserAuthRes);
    }
    handleAllowedUsage();
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
    checkBrowser();
    checkLocalhost();

    const checkBrowserIntervalId = setInterval(checkBrowser, 60000); // 1m
    const checkLocalhostIntervalId = setInterval(checkLocalhost, 5000); // 5s

    return () => {
      clearInterval(checkBrowserIntervalId);
      clearInterval(checkLocalhostIntervalId);
    };
  }, []);

  useEffect(() => {
    getUserInfo();
    getLocalhostConfig();
  }, [browserValid, localhostValid]);

  return (
    <ListEnvironmentContext.Provider
      value={{
        localhostInfo,
        getUserInfo,
        userInfo,
        listEnvironments,
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
