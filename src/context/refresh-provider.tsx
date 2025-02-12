import { createConnectTransport } from "@connectrpc/connect-web";
import { createClient } from "@connectrpc/connect";
import { UserService } from "api/js/svc/user/v1/service_connect";
import { getAPIURL } from "@/lib/envs";

const refreshTransport = createConnectTransport({
  baseUrl: getAPIURL(),
});

export const refreshClient = createClient(UserService, refreshTransport);
