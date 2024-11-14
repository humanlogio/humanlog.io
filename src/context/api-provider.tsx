"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { createClient, Client } from "@connectrpc/connect";
import { Interceptor } from "@connectrpc/connect";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConnectTransport } from "@connectrpc/connect-web";
import { TransportProvider } from "@connectrpc/connect-query";
import { AuthService } from "api/js/svc/auth/v1/service_connect";
import { EnvironmentService } from "api/js/svc/environment/v1/service_connect";
import { OrganizationService } from "api/js/svc/organization/v1/service_connect";
import { UserService } from "api/js/svc/user/v1/service_connect";
import { LocalhostService } from "api/js/svc/localhost/v1/service_connect";
import { QueryService } from "api/js/svc/query/v1/service_connect";
import { ProductService } from "api/js/svc/product/v1/service_connect";
import { getAPIURL } from "@/lib/envs";

type EnvironmentId = bigint | undefined;

type ApiProviderType = {
  apiClients: ApiClients | null;
  activeEnvironment: EnvironmentId;
  setActiveEnvironment: React.Dispatch<React.SetStateAction<EnvironmentId>>;
};

type ApiClients = {
  auth: Client<typeof AuthService>;
  product: Client<typeof ProductService>;
  environment: Client<typeof EnvironmentService>;
  org: Client<typeof OrganizationService>;
  user: Client<typeof UserService>;
  localhost: Client<typeof LocalhostService>;
  query: Client<typeof QueryService>;
};

const ApiClientContext = createContext<ApiProviderType | null>(null);

const localhostTransport = createConnectTransport({
  baseUrl: "http://localhost:32764",
});
const apiTransport = createConnectTransport({
  baseUrl: getAPIURL(),
  interceptors: getInterceptors(),
});

const queryClient = new QueryClient();

export function ApiClientsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeEnvironment, setActiveEnvironment] = useState<EnvironmentId>();

  const apiClients = useMemo((): ApiClients => {
    const activeTransport = !activeEnvironment
      ? localhostTransport
      : apiTransport;

    // localhost client should always talk using the localhost transport
    const localhost = createClient(LocalhostService, localhostTransport);
    return {
      localhost,
      auth: createClient(AuthService, apiTransport),
      product: createClient(ProductService, apiTransport),
      environment: createClient(EnvironmentService, apiTransport),
      org: createClient(OrganizationService, apiTransport),
      user: createClient(UserService, apiTransport),
      query: createClient(QueryService, activeTransport),
    };
  }, [activeEnvironment]);

  return (
    <TransportProvider transport={apiTransport}>
      <QueryClientProvider client={queryClient}>
        <ApiClientContext.Provider
          value={{ apiClients, activeEnvironment, setActiveEnvironment }}
        >
          {children}
        </ApiClientContext.Provider>
      </QueryClientProvider>
    </TransportProvider>
  );
}

export function useApiClients(): ApiProviderType {
  return useContext(ApiClientContext)!;
}

function getInterceptors(): Interceptor[] {
  const cookie = getCookie("hlog_session");
  let interceptors: Interceptor[] = [];
  if (cookie) {
    interceptors = interceptors.concat(auther(cookie));
  }
  return interceptors;
}

function auther(cookie: string): Interceptor {
  return (next) => async (req) => {
    req.header.set("Browser-Authorization", cookie);
    const res = await next(req);
    // console.log("res", res);
    res.header.get("content-type");
    const cookies = res.header.getSetCookie();
    if (cookies.length > 1) {
      // console.log(cookies);
    }
    return res;
  };
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
