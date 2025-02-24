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
import { useRouter } from "next/navigation";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import config from "@/features/config";

export type UserState = User | "loading" | "not-logged-in";

type AllEnvironments = {
  user: UserState;
  localhostInfo: PingResponse | undefined;
  currentOrg: Organization | null;
  defaultOrg: Organization | null;
  listEnvironments: ListEnvironmentResponse_ListItem[];
  doLogin: () => void;
};

const ListEnvironmentContext = createContext<AllEnvironments>({
  user: "loading",
  localhostInfo: undefined,
  currentOrg: null,
  defaultOrg: null,
  listEnvironments: [],
  doLogin: () => {},
});

export function ListEnvironmentsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const returnToURL = getSelfURL();

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
  const [cookies, setCookie] = useCookies();

  const getRefreshToken = async () => {
    try {
      const res = await apiClients?.user.refreshUserToken({});

      setCookie("hlog_session", res?.token, {
        path: "/",
        domain: `.humanlog${config.TLD}`,
        secure: true,
        sameSite: "strict",
      });

      return res;
    } catch (err) {
      if (err instanceof ConnectError) {
        if (err.code === Code.Unauthenticated) {
          document.cookie = `hlog_session=; path=/; domain=.humanlog${config.TLD}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          setBrowserValid(false);
          setUser("not-logged-in");
          toast.info(
            "Your session has expired. Please log in again to continue.",
          );
          router.push("/login");
        }
        throw err;
      }
    }
  };

  const checkBrowser = async () => {
    try {
      const res = await apiClients?.user.whoami({});
      if (!res) {
        setBrowserValid(false);
        return;
      }
      setBrowserValid(true);
      return res;
    } catch (err) {
      getRefreshToken();
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

  const doBrowserLogin = async () => {
    try {
      const req = new GetAuthURLRequest({ returnToUrl: returnToURL });
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
      console.log("failed to Login at the browser");
    }
  };

  const doLocalhostLogin = async () => {
    try {
      await apiClients?.localhost.doLogin({ returnToURL });
    } catch (error) {
      console.log("failed to Login at the cli");
    }
  };

  const doLogin = async () => {
    if (browserValid && localhostValid) {
      return;
    }
    if (localhostValid && !localhostInfo?.loggedInUser) {
      doLocalhostLogin();
      getUserInfo();
      return;
    }
    if (!browserValid) {
      doBrowserLogin();
      getUserInfo();
      return;
    }
  };

  const getUserInfo = async () => {
    let _user: UserState = "not-logged-in";
    let _currentOrg;
    let _defaultOrg;

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
        _currentOrg = currentOrganization;
        _defaultOrg = defaultOrganization;
      }
    }
    if (browserValid) {
      const browserAuthRes = await checkBrowser();
      _user = browserAuthRes?.user ?? "not-logged-in";
      _currentOrg = browserAuthRes?.currentOrganization;
      _defaultOrg = browserAuthRes?.defaultOrganization;
    }

    setUser(_user);
    setCurrentOrg(_currentOrg ?? null);
    setDefaultOrg(_defaultOrg ?? null);
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
        user,
        currentOrg,
        defaultOrg,
        listEnvironments,
        doLogin,
      }}
    >
      {children}
    </ListEnvironmentContext.Provider>
  );
}

export function useAllEnvironments(): AllEnvironments {
  return useContext(ListEnvironmentContext)!;
}
