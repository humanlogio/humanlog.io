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
import { IngestService } from "api/js/svc/ingest/v1/service_connect";
import { UserService } from "api/js/svc/user/v1/service_connect";
import { LocalhostService } from "api/js/svc/localhost/v1/service_connect";
import { ProductService } from "api/js/svc/product/v1/service_connect";
import { FeatureService } from "api/js/svc/feature/v1/service_connect";
import { QueryService } from "api/js/svc/query/v1/service_connect";
import { TraceService } from "api/js/svc/query/v1/trace_service_connect";
import { UpdateService } from "api/js/svc/cliupdate/v1/service_connect";

import {
  PublicShareService,
  UserShareService,
} from "api/js/svc/share/v1/service_connect";
import { getAPIURL, getSelfURL } from "@/lib/envs";
import { useCookies } from "react-cookie";
import { Environment } from "api/js/types/v1/environment_pb";
import config from "@/features/config";
import { v4 as uuidv4 } from "uuid";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

type ApiProviderType = {
  apiClients: ApiClients | null;
  activeEnvironment: Environment | undefined;
  setActiveEnvironment: React.Dispatch<
    React.SetStateAction<Environment | undefined>
  >;
  authenticated: boolean;
};

type ApiClients = {
  auth: Client<typeof AuthService>;
  product: Client<typeof ProductService>;
  environment: Client<typeof EnvironmentService>;
  org: Client<typeof OrganizationService>;
  user: Client<typeof UserService>;
  localhost: Client<typeof LocalhostService>;
  ingest: Client<typeof IngestService>;
  feature: Client<typeof FeatureService>;
  publicShare: Client<typeof PublicShareService>;
  userShare: Client<typeof UserShareService>;
  query: Client<typeof QueryService>;
  trace: Client<typeof TraceService>;
  update: Client<typeof UpdateService>;
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
  const isProd = config.NEXT_PUBLIC_IS_PROD;
  const router = useRouter();
  const returnToURL = getSelfURL();

  const [cookies, setCookie] = useCookies();
  const [apiTransport, setApiTransport] = useState<Transport>();
  const [activeEnvironment, setActiveEnvironment] = useState<
    Environment | undefined
  >();
  const [authenticated, setAuthenticated] = useState(false);
  const searchParams = useSearchParams();
  const localhostPort = searchParams.get("demo_port") ?? "32764";
  const localhostBaseUrl = `http://localhost:${localhostPort}`;

  const apiClients = useMemo((): ApiClients => {
    const auther = (): Interceptor => {
      return (next) => async (req) => {
        const token =
          cookies["hlog_session"] || localStorage.getItem("hlog_session");

        if (token && token != "") {
          localStorage.setItem("hlog_session", token);
          req.header.set("Browser-Authorization", token);
        }
        req.header.set("Request-Id", uuidv4());

        try {
          const res = await next(req);
          const newToken =
            res.header.get("UseAuthorization") ||
            res.header.get("useauthorization");

          if (newToken) {
            console.log("Received new authorization token");
            localStorage.setItem("hlog_session", newToken);
          }
          setAuthenticated(true);
          return res;
        } catch (error) {
          if (error instanceof ConnectError) {
            if (error.code === Code.Unauthenticated) {
              setAuthenticated(false);
            }
          }
          throw error;
        }
      };
    };

    const localhostTransport = createConnectTransport({
      baseUrl: localhostBaseUrl,
    });
    const apiTpt = createConnectTransport({
      baseUrl: getAPIURL(),
      interceptors: [auther()],
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
      feature: createClient(FeatureService, apiTpt),
      publicShare: createClient(PublicShareService, apiTpt),
      userShare: createClient(UserShareService, apiTpt),
      query: createClient(QueryService, activeTransport),
      trace: createClient(TraceService, activeTransport),
      ingest: createClient(IngestService, activeTransport),
      update: createClient(UpdateService, apiTpt),

      apiTransport: apiTpt,
      localhostTransport: localhostTransport,
      activeTransport: activeTransport,
    };
  }, [activeEnvironment]);

  return (
    <TransportProvider transport={apiTransport!}>
      <QueryClientProvider client={queryClient}>
        <ApiClientContext.Provider
          value={{
            apiClients,
            activeEnvironment,
            setActiveEnvironment,
            authenticated,
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
