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
  const isProd = config.NEXT_PUBLIC_SIGNUP_ONLY;
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
        if (token && token != "") {
          req.header.set("Browser-Authorization", token);
        }
        req.header.set("Request-Id", uuidv4());

        const res = await next(req);
        const newToken = res.header.get("UseAuthorization");

        !isProd && console.log("res.header", res.header);

        if (newToken) {
          console.log("Received new authorization token");
          setCookie("hlog_session", newToken, {
            path: "/",
            domain: `.humanlog${config.TLD}`,
            secure: true,
            sameSite: "strict",
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

  const getRefreshToken = async () => {
    try {
      const res = await apiClients.user.refreshUserToken({});

      setRefreshToken(res);

      setCookie("hlog_session", res.token, {
        path: "/",
        domain: `.humanlog${config.TLD}`,
        secure: true,
        sameSite: "strict",
      });

      return res;
    } catch (err) {
      if (err instanceof ConnectError) {
        if (err.code === Code.Unauthenticated) {
          setRefreshToken(null);
          deleteCookie();
          toast.info(
            "Your session has expired. Please log in again to continue.",
          );
          router.push("/login");
        }
        throw err;
      }
    }
  };

  useEffect(() => {
    // initial execute
    if (humanlogSessionCookie) {
      getRefreshToken();
    }
  }, []);

  useEffect(() => {
    if (!refreshToken) return;

    const targetTime = dayjs(refreshToken?.refreshAt?.toDate());
    const now = dayjs();

    const timeUntilRefresh = targetTime.diff(now);

    if (timeUntilRefresh <= 5000) {
      getRefreshToken();
    }

    // Wait until next refresh time
    const timer = setTimeout(async () => {
      try {
        await getRefreshToken();
      } catch (error) {
        console.error("Token refresh failed:", error);
      }
    }, timeUntilRefresh);

    return () => clearTimeout(timer);
  }, [refreshToken]);

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
