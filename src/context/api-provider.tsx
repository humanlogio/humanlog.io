"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import {
  createClient,
  Client,
  Transport,
  ConnectError,
  Code,
} from "@connectrpc/connect";
import { Interceptor } from "@connectrpc/connect";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConnectTransport } from "@connectrpc/connect-web";
import { TransportProvider, useQuery } from "@connectrpc/connect-query";
import { AuthService } from "api/js/svc/auth/v1/service_connect";
import { EnvironmentService } from "api/js/svc/environment/v1/service_connect";
import { OrganizationService } from "api/js/svc/organization/v1/service_connect";
import { UserService } from "api/js/svc/user/v1/service_connect";
import { LocalhostService } from "api/js/svc/localhost/v1/service_connect";
import { QueryService } from "api/js/svc/query/v1/service_connect";
import { ProductService } from "api/js/svc/product/v1/service_connect";
import { getAPIURL, getSelfURL } from "@/lib/envs";
import { useCookies } from "react-cookie";
import { Environment } from "api/js/types/v1/environment_pb";
import { useRouter } from "next/navigation";
import config from "@/features/config";
import { v4 as uuidv4 } from "uuid";
import { refreshClient } from "@/context/refresh-provider";

type ApiProviderType = {
  apiClients: ApiClients | null;
  activeEnvironment: Environment | undefined;
  setActiveEnvironment: React.Dispatch<
    React.SetStateAction<Environment | undefined>
  >;
  doLogout: () => void;
};

type ApiClients = {
  auth: Client<typeof AuthService>;
  product: Client<typeof ProductService>;
  environment: Client<typeof EnvironmentService>;
  org: Client<typeof OrganizationService>;
  user: Client<typeof UserService>;
  localhost: Client<typeof LocalhostService>;
  query: Client<typeof QueryService>;

  apiTransport: Transport;
  localhostTransport: Transport;
  activeTransport: Transport;
};

const ApiClientContext = createContext<ApiProviderType | null>(null);

const queryClient = new QueryClient();

export function ApiClientsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const returnToURL = getSelfURL();

  const [cookies, setCookie] = useCookies();

  let humanlogSessionCookie = cookies["hlog_session"];

  const [apiTransport, setApiTransport] = useState<Transport>();
  const [activeEnvironment, setActiveEnvironment] = useState<
    Environment | undefined
  >();
  const [authToken, setAuthToken] = useState<string>(
    humanlogSessionCookie || "",
  );
  const router = useRouter();

  const doLogout = async () => {
    document.cookie = `hlog_session=; path=/; domain=.humanlog${config.TLD}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    try {
      await apiClients.localhost.doLogout({
        returnToURL,
      });
    } catch (error) {
      console.error("Failed to get logout URL:", error);
      // router.push("/login");
    }
  };

  const getRefreshToken = async () => {
    try {
      const res = await refreshClient?.refreshUserToken({});
      return res;
    } catch (err) {
      return null;
    }
  };

  const apiClients = useMemo((): ApiClients => {
    let refreshPromise: Promise<string | null> | null = null;

    const auther = (
      token: string,
      setToken: (token: string) => void,
    ): Interceptor => {
      return (next) => async (req) => {
        if (token && token != "") {
          req.header.set("Browser-Authorization", token);
        }
        req.header.set("Request-Id", uuidv4());

        try {
          return await next(req);
        } catch (error: any) {
          if (!refreshPromise) {
            refreshPromise = getRefreshToken()
              .then((refreshRes) => {
                if (refreshRes?.token) {
                  console.log("Token refreshed successfully");
                  setToken(refreshRes.token);
                  return refreshRes.token;
                } else {
                  throw new Error("No refresh token received");
                }
              })
              .finally(() => {
                refreshPromise = null;
              });
          }

          const newToken = await refreshPromise;

          if (newToken) {
            req.header.set("Browser-Authorization", newToken);
            return await next(req);
          }

          throw error;
        }
      };
    };

    const localhostTransport = createConnectTransport({
      baseUrl: "http://localhost:32764",
    });

    const apiTpt = createConnectTransport({
      baseUrl: getAPIURL(),
      interceptors: [
        auther(authToken, (newToken) => {
          setAuthToken(newToken);
          setCookie("hlog_session", newToken);
        }),
      ],
    });
    setApiTransport(apiTpt);

    const activeTransport = !activeEnvironment ? localhostTransport : apiTpt;

    // localhost client should always talk using the localhost transport
    const localhost = createClient(LocalhostService, localhostTransport);

    return {
      localhost,
      auth: createClient(AuthService, apiTpt),
      product: createClient(ProductService, apiTpt),
      environment: createClient(EnvironmentService, apiTpt),
      org: createClient(OrganizationService, apiTpt),
      user: createClient(UserService, apiTpt),
      query: createClient(QueryService, activeTransport),

      apiTransport: apiTpt,
      localhostTransport: localhostTransport,
      activeTransport: activeTransport,
    };
  }, [humanlogSessionCookie, authToken, activeEnvironment]);

  return (
    <TransportProvider transport={apiTransport!}>
      <QueryClientProvider client={queryClient}>
        <ApiClientContext.Provider
          value={{
            apiClients,
            activeEnvironment,
            setActiveEnvironment,
            doLogout,
          }}
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
