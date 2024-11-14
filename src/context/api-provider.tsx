"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { createClient, Client } from "@connectrpc/connect";
import { Interceptor } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
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

const auther: (cookie: string) => Interceptor = (cookie: string) => {
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
};

export function ApiClientsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeEnvironment, setActiveEnvironment] = useState<EnvironmentId>();

  const apiClients = useMemo((): ApiClients => {
    const cookie = getCookie("hlog_session");

    let interceptors: Interceptor[] = [];
    if (cookie) {
      interceptors = interceptors.concat(auther(cookie));
    }

    const localhostTransport = createConnectTransport({
      baseUrl: "http://localhost:32764",
    });
    const localhost = createClient(LocalhostService, localhostTransport);
    const apiTransport = createConnectTransport({
      baseUrl: getAPIURL(),
      interceptors: interceptors,
    });

    const activeTrasnport = !activeEnvironment
      ? localhostTransport
      : apiTransport;

    return {
      localhost,
      auth: createClient(AuthService, apiTransport),
      product: createClient(ProductService, apiTransport),
      environment: createClient(EnvironmentService, apiTransport),
      org: createClient(OrganizationService, apiTransport),
      user: createClient(UserService, apiTransport),
      query: createClient(QueryService, activeTrasnport),
    };
  }, [activeEnvironment]);

  return (
    <ApiClientContext.Provider
      value={{ apiClients, activeEnvironment, setActiveEnvironment }}
    >
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

export function useApiClients(): ApiProviderType {
  return useContext(ApiClientContext)!;
}
