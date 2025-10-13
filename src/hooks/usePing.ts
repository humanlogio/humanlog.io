import { useApiClients } from "@/context/api-provider";
import { useQuery } from "@connectrpc/connect-query";
import { ping } from "api/js/svc/localhost/v1/service-LocalhostService_connectquery";

export const usePing = () => {
  const { apiClients } = useApiClients();

  const {
    data: localhostData,
    isLoading: isLoadingLocalhost,
    isError: isErrorLocalhost,
  } = useQuery(
    ping,
    {},
    {
      refetchInterval: 5000,
      transport: apiClients?.localhostTransport,
    },
  );

  return {
    localhostData: isErrorLocalhost ? undefined : localhostData,
    isLoadingLocalhost,
    isErrorLocalhost,
  };
};
