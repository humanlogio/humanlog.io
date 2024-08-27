import React, { createContext, useContext, useMemo } from 'react';
import { createPromiseClient, PromiseClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import { AuthService } from 'api/js/svc/auth/v1/service_connect';
import { UserService } from 'api/js/svc/user/v1/service_connect';

const ApiClientContext = createContext<ApiClients | null>(null);

export type ApiClients = {
    auth: PromiseClient<typeof AuthService>;
    user: PromiseClient<typeof UserService>;
};

export function ApiClientsProvider({ children }: { children: React.ReactNode }) {
    const apiClients = useMemo((): ApiClients => {
        const transport = createConnectTransport({ baseUrl: process.env.API_BASE_URL || "https://api.humanlog.io" });
        return {
            auth: createPromiseClient(AuthService, transport),
            user: createPromiseClient(UserService, transport),
        }
    }, []);
    return (
        <ApiClientContext.Provider value={apiClients}>
            {children}
        </ApiClientContext.Provider>
    );
}

export function useApiClients() {
    return useContext(ApiClientContext);
}
