"use client";

// Global BigInt serialization fix for Connect RPC and TanStack Query
// Automatically converts BigInt to string when JSON.stringify is called
if (typeof BigInt !== "undefined") {
  // @ts-ignore
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };
}

import React, { createContext, useContext, useMemo } from "react";
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
import { TransportProvider } from "@connectrpc/connect-query";
import { AuthService } from "api/js/svc/auth/v1/service_pb";
import { EnvironmentService } from "api/js/svc/environment/v1/service_pb";
import { OrganizationService } from "api/js/svc/organization/v1/service_pb";
import { IngestService } from "api/js/svc/ingest/v1/service_pb";
import { UserService } from "api/js/svc/user/v1/service_private_pb";
import { LocalhostService } from "api/js/svc/localhost/v1/service_pb";
import { ProductService } from "api/js/svc/product/v1/service_pb";
import { FeatureService } from "api/js/svc/feature/v1/service_pb";
import { QueryService } from "api/js/svc/query/v1/service_pb";
import { ProjectService } from "api/js/svc/project/v1/service_pb";
import { TraceService } from "api/js/svc/query/v1/trace_service_pb";
import { UpdateService } from "api/js/svc/cliupdate/v1/service_pb";
import { DashboardService } from "api/js/svc/dashboard/v1/service_pb";
import { AlertService } from "api/js/svc/alert/v1/service_pb";
import {
  PublicShareService,
  UserShareService,
} from "api/js/svc/share/v1/service_pb";
import { getAPIURL } from "@/lib/config/envs";
import config from "@/lib/config";
import { v4 as uuidv4 } from "uuid";
import { useSearchParams } from "next/navigation";
import { useEnvironmentStore } from "@/stores/environment-store";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { authClient } from "@/lib/auth-client";
import { useOrganizationStore, useUserStore } from "@/stores/user-store";
import { createMockOrganization } from "@/lib/utils/mock-user-data";

type ApiProviderType = {
  apiClients: ApiClients | null;
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
  project: Client<typeof ProjectService>;
  dashboard: Client<typeof DashboardService>;
  alert: Client<typeof AlertService>;
  apiTransport: Transport;
  localhostTransport: Transport;
  activeTransport: Transport;
};

const ApiClientContext = createContext<ApiProviderType | null>(null);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ActiveTransportContext = createContext<Transport | null>(null);

export function ApiClientsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isProd = config.NEXT_PUBLIC_IS_PROD;

  const searchParams = useSearchParams();
  const localhostPort = searchParams.get("demo_port") ?? "32764";
  const localhostBaseUrl = `http://localhost:${localhostPort}`;
  const { getSession } = authClient;
  const { setUser, setSession } = useUserStore();
  const { setCurrentOrganization, setDefaultOrganization } =
    useOrganizationStore();

  const { activeEnvironment, setActiveEnvironment } = useEnvironmentStore();

  const transports = useMemo(() => {
    const auther = (): Interceptor => {
      return (next) => async (req) => {
        const { data } = await getSession();
        const token = data?.session.token;

        if (token && token != "") {
          localStorage.setItem("hlog_session", token);
          req.header.set("Browser-Authorization", token);
          setUser(data?.user);
          setSession(data?.session);
          // TODO: Remove this after real API is implemented
          setCurrentOrganization(createMockOrganization().currentOrganization);
          setDefaultOrganization(createMockOrganization().defaultOrganization);
        }
        req.header.set("Request-Id", uuidv4());

        try {
          const res = await next(req);

          return res;
        } catch (error) {
          if (error instanceof ConnectError) {
            if (error.code === Code.Unauthenticated) {
              setUser(undefined);
              setSession(undefined);
              setActiveEnvironment(undefined);
              // TODO: Remove this after real API is implemented
              setCurrentOrganization(undefined);
              setDefaultOrganization(undefined);
            }
          }
          throw error;
        }
      };
    };

    const localhostTransport = createConnectTransport({
      baseUrl: localhostBaseUrl,
    });
    const apiTransport = createConnectTransport({
      baseUrl: getAPIURL(),
      interceptors: [auther()],
    });

    return { localhostTransport, apiTransport };
  }, [localhostBaseUrl]);

  const activeTransport = useMemo(
    () =>
      !activeEnvironment
        ? transports.localhostTransport
        : transports.apiTransport,
    [activeEnvironment, transports],
  );

  const apiClients = useMemo((): ApiClients => {
    return {
      localhost: createClient(LocalhostService, transports.localhostTransport),
      auth: createClient(AuthService, transports.apiTransport),
      product: createClient(ProductService, transports.apiTransport),
      environment: createClient(EnvironmentService, transports.apiTransport),
      org: createClient(OrganizationService, transports.apiTransport),
      user: createClient(UserService, transports.apiTransport),
      feature: createClient(FeatureService, transports.apiTransport),
      publicShare: createClient(PublicShareService, transports.apiTransport),
      userShare: createClient(UserShareService, transports.apiTransport),
      update: createClient(UpdateService, transports.apiTransport),
      query: createClient(QueryService, activeTransport),
      trace: createClient(TraceService, activeTransport),
      ingest: createClient(IngestService, activeTransport),
      project: createClient(ProjectService, activeTransport),
      dashboard: createClient(DashboardService, activeTransport),
      alert: createClient(AlertService, activeTransport),

      apiTransport: transports.apiTransport,
      localhostTransport: transports.localhostTransport,
      activeTransport: activeTransport,
    };
  }, [transports, activeTransport]);

  return (
    <QueryClientProvider client={queryClient}>
      <ApiClientContext.Provider
        value={{
          apiClients,
        }}
      >
        <ActiveTransportContext.Provider value={activeTransport}>
          <TransportProvider transport={transports.apiTransport}>
            {children}
          </TransportProvider>
        </ActiveTransportContext.Provider>
      </ApiClientContext.Provider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export function useApiClients(): ApiProviderType {
  return useContext(ApiClientContext)!;
}

export function useActiveTransport(): Transport {
  const transport = useContext(ActiveTransportContext);
  if (!transport)
    throw new Error(
      "useActiveTransport must be used within ApiClientsProvider",
    );
  return transport;
}

export function ActiveTransportProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const transport = useActiveTransport();
  return (
    <TransportProvider transport={transport}>{children}</TransportProvider>
  );
}
