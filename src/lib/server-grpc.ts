import { PublicShareService } from "api/js/svc/share/v1/service_pb";
import { getAPIURL } from "@/lib/envs";
import { createConnectTransport } from "@connectrpc/connect-web";
import { createClient } from "@connectrpc/connect";

export function createServerGrpcClient() {
  const apiURL = getAPIURL();

  const transport = createConnectTransport({
    baseUrl: apiURL,
  });

  const publicShareClient = createClient(PublicShareService, transport);

  return {
    publicShareClient,
  };
}
