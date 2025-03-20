"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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
import dayjs from "dayjs";
import { RefreshUserTokenResponse } from "api/js/svc/user/v1/service_pb";
import { Timestamp } from "@bufbuild/protobuf";
import { toast } from "sonner";

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
  const isProd = process.env.NODE_ENV === "production";
  const returnToURL = getSelfURL();

  const [cookies, setCookie] = useCookies();
  const [apiTransport, setApiTransport] = useState<Transport>();
  const [activeEnvironment, setActiveEnvironment] = useState<
    Environment | undefined
  >();
  const [refreshToken, setRefreshToken] =
    useState<RefreshUserTokenResponse | null>();

  const router = useRouter();

  let humanlogSessionCookie = cookies["hlog_session"];

  const deleteCookie = () => {
    document.cookie = `hlog_session=; path=/; domain=.humanlog${config.TLD}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  };

  const doLogout = async () => {
    deleteCookie();

    try {
      await apiClients.localhost.doLogout({
        returnToURL,
      });
    } catch (error) {
      console.error("Failed to get logout URL:", error);
      // router.push("/login");
    }
  };

  const apiClients = useMemo((): ApiClients => {
    const auther = (token: string): Interceptor => {
      return (next) => async (req) => {
        if (!token) {
          token = cookies["hlog_session"];
        }
        if (token && token != "") {
          req.header.set("Browser-Authorization", token);
        }
        req.header.set("Request-Id", uuidv4());

        const res = await next(req);
        const newToken =
          res.header.get("UseAuthorization") ||
          res.header.get("useauthorization");

        !isProd && console.log("res.header", res.header);

        if (newToken) {
          console.log("Received new authorization token");
          token = newToken;
          setCookie("hlog_session", newToken, {
            path: "/",
            domain: `.humanlog${config.TLD}`,
            secure: true,
            sameSite: "none",
          });
        }
        return res;
      };
    };

    const localhostTransport = createConnectTransport({
      baseUrl: "http://localhost:32764",
    });
    const apiTpt = createConnectTransport({
      baseUrl: getAPIURL(),
      interceptors: [auther(humanlogSessionCookie)],
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
  }, [humanlogSessionCookie, activeEnvironment]);

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
