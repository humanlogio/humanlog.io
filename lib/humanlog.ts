import { createPromiseClient } from '@connectrpc/connect'
import { createConnectTransport } from '@connectrpc/connect-web'

// humanlog.io API services
import { AuthService } from "api/js/svc/auth/v1/service_connect";
import { QueryService } from "api/js/svc/query/v1/service_connect";
import { LogEventGroup } from "api/js/svc/query/v1/service_pb";

// TODO(aybabtme): seed this in the start script
const apiURL = 'http://localhost:8080'

const authClient = createPromiseClient(AuthService, createConnectTransport({ baseUrl: apiURL }));
const queryClient = createPromiseClient(QueryService, createConnectTransport({ baseUrl: apiURL }));

const authURLRes = await authClient.getAuthURL({});
// send user to `authURLRes.authUrl` for login