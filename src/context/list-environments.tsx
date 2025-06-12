"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Code, ConnectError } from "@connectrpc/connect";
import { useApiClients } from "@/context/api-provider";
import { PingResponse } from "api/js/svc/localhost/v1/service_pb";
import { ListEnvironmentResponse_ListItem } from "api/js/svc/organization/v1/service_pb";
import { User } from "api/js/types/v1/user_pb";
import { Organization } from "api/js/types/v1/organization_pb";
import { Cursor } from "api/js/types/v1/cursor_pb";
import {
  GetAuthURLRequest,
  LocalhostViaBrowser,
} from "api/js/svc/auth/v1/service_pb";
import { getSelfURL } from "@/lib/envs";
import { usePathname, useRouter } from "next/navigation";
import config from "@/features/config";
import { BinaryOp_Operator, Expr } from "api/js/types/v1/query_pb";
import { AllowedUsageResponse } from "api/js/svc/feature/v1/service_pb";
import { AllowedUsageResponse_LocalhostUsage } from "api/js/svc/feature/v1/service_pb";
import { getAllowedUsage } from "@/services/featureService";

export type UserState = User | "loading" | "not-logged-in";

export type FilterBySymbol = {
  symbolName: Expr;
  symbolValue: Expr;
  op?: BinaryOp_Operator;
};

type AllEnvironments = {
  user: UserState;
  localhostInfo: PingResponse | undefined;
  currentOrg: Organization | null;
  defaultOrg: Organization | null;
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
};

const ListEnvironmentContext = createContext<AllEnvironments>({
  user: "loading",
  localhostInfo: undefined,
  currentOrg: null,
  defaultOrg: null,
  listEnvironments: [],
  doLogin: () => {},
  doLogout: () => {},
  getUserInfo: () => {},
  filterBySymbol: null,
  onClickFilterBy: () => {},
  allowedUsage: null,
  handleAllowedUsage: () => {},
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
  const [user, setUser] = useState<UserState>("loading");
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [defaultOrg, setDefaultOrg] = useState<Organization | null>(null);
  const [listEnvironments, setListEnvironments] = useState<
    ListEnvironmentResponse_ListItem[]
  >([]);
  const [environmentPage, setEnvironmentPage] = useState<Cursor>(new Cursor());
  const [filterBySymbol, setFilterBySymbol] = useState<FilterBySymbol | null>(
    null,
  );
  const [allowedUsage, setAllowedUsage] =
    useState<AllowedUsageResponse_LocalhostUsage | null>(null);

  // TODO: broken🛠️
  // const getRefreshToken = async () => {
  //   try {
  //     const res = await apiClients?.user.refreshUserToken({});

  //     setCookie("hlog_session", res?.token, {
  //       path: "/",
  //       domain: `.humanlog${config.TLD}`,
  //       secure: true,
  //       sameSite: "strict",
  //     });

  //     return res;
  //   } catch (err) {
  //     if (err instanceof ConnectError) {
  //       if (err.code === Code.Unauthenticated) {
  //         document.cookie = `hlog_session=; path=/; domain=.humanlog${config.TLD}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  //         setBrowserValid(false);
  //         setUser("not-logged-in");

  //         toast.info(
  //           "Your session has expired. Please log in again to continue.",
  //         );
  //         // router.push("/login");
  //         doLogin();
  //       }
  //       throw err;
  //     }
  //   }
  // };

  const deleteCookie = () => {
    document.cookie = `hlog_session=; path=/; domain=.humanlog${config.TLD}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  };

  const checkBrowser = async () => {
    try {
      const res = await apiClients?.user.whoami({});
      if (res && res.user) {
        setBrowserValid(true);
        setUser(res?.user);
        return res;
      }
    } catch (err) {
      document.cookie = `hlog_session=; path=/; domain=.humanlog${config.TLD}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      setBrowserValid(false);
      setUser("not-logged-in");
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
      const req = new GetAuthURLRequest({ returnToUrl: returnUrl });
      if (localhostInfo?.meta) {
        req.localhost = new LocalhostViaBrowser({
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

      const req = new GetAuthURLRequest({ returnToUrl: returnToURL });
      if (localhostAuthRes?.meta) {
        req.localhost = new LocalhostViaBrowser({
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
      setUser(browserAuthRes?.user ?? "not-logged-in");
      setCurrentOrg(browserAuthRes?.currentOrganization ?? null);
      setDefaultOrg(browserAuthRes?.defaultOrganization ?? null);
    }
    handleAllowedUsage();
  };

  const handleAllowedUsage = async () => {
    if (!apiClients || user === "loading" || user === "not-logged-in") return;
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
  }, [browserValid, localhostValid]);

  return (
    <ListEnvironmentContext.Provider
      value={{
        localhostInfo,
        getUserInfo,
        user,
        currentOrg,
        defaultOrg,
        listEnvironments,
        doLogin,
        doLogout,
        filterBySymbol,
        onClickFilterBy,
        allowedUsage,
        handleAllowedUsage,
      }}
    >
      {children}
    </ListEnvironmentContext.Provider>
  );
}

export function useAllEnvironments(): AllEnvironments {
  return useContext(ListEnvironmentContext)!;
}
