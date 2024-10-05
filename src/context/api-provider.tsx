"use client";

import React, { createContext, useContext, useMemo } from "react";
import { createPromiseClient, PromiseClient } from "@connectrpc/connect";
import { Interceptor } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { AuthService } from "api/js/svc/auth/v1/service_connect";
import { AccountService } from "api/js/svc/account/v1/service_connect";
import { OrganizationService } from "api/js/svc/organization/v1/service_connect";
import { UserService } from "api/js/svc/user/v1/service_connect";
import { LocalhostService } from "api/js/svc/localhost/v1/service_connect";
import { QueryService } from "api/js/svc/query/v1/service_connect";

const ApiClientContext = createContext<ApiClients | null>(null);

const auther: (cookie: string) => Interceptor = (cookie: string) => {
  return (next) => async (req) => {
    req.header.set("Browser-Authorization", cookie);
    const res = await next(req);
    console.log("res", res);
    res.header.get("content-type");
    const cookies = res.header.getSetCookie();
    if (cookies.length > 1) {
      console.log(cookies);
    }
    return res;
  };
};

export type ApiClients = {
  auth: PromiseClient<typeof AuthService>;
  account: PromiseClient<typeof AccountService>;
  org: PromiseClient<typeof OrganizationService>;
  user: PromiseClient<typeof UserService>;
  localhost: PromiseClient<typeof LocalhostService>;
  query: PromiseClient<typeof QueryService>;
};

export function ApiClientsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const apiClients = useMemo((): ApiClients => {
    const cookie = getCookie("hlog_session");

    let interceptors: Interceptor[] | undefined = [];
    if (cookie) {
      interceptors = interceptors.concat(auther(cookie));
    }

    const apiTransport = createConnectTransport({
      baseUrl: process.env.API_BASE_URL ?? "https://api.humanlog.dev",
      interceptors: interceptors,
    });
    const auth = createPromiseClient(AuthService, apiTransport);
    const account = createPromiseClient(AccountService, apiTransport);
    const org = createPromiseClient(OrganizationService, apiTransport);
    const user = createPromiseClient(UserService, apiTransport);
    const query = createPromiseClient(QueryService, apiTransport);

    const localhostTransport = createConnectTransport({
      baseUrl: "http://localhost:32764",
    });
    const localhost = createPromiseClient(LocalhostService, localhostTransport);
    return {
      auth: auth,
      account: account,
      org: org,
      user: user,
      localhost: localhost,
      query: query,
    };
  }, []);
  return (
    <ApiClientContext.Provider value={apiClients}>
      {children}
    </ApiClientContext.Provider>
  );
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (!parts || parts.length !== 2) {
    return undefined;
  }
  const last = parts.pop()!;
  return last.split(";").shift();
}

export function useApiClients(): ApiClients {
  return useContext(ApiClientContext)!;
}
