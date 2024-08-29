"use client";

import React, { createContext, useContext, useMemo } from 'react';
import { createPromiseClient, PromiseClient } from '@connectrpc/connect';
import { Interceptor } from "@connectrpc/connect";
import { createConnectTransport } from '@connectrpc/connect-web';
import { AuthService } from 'api/js/svc/auth/v1/service_connect';
import { UserService } from 'api/js/svc/user/v1/service_connect';

const ApiClientContext = createContext<ApiClients | null>(null);

const auther: (cookie: string) => Interceptor = (cookie: string) => {
    return (next) => async (req) => {
        req.header.set("BrowserAuthorization", cookie);
        console.log(req.header);
        return await next(req);
    }
};

export type ApiClients = {
    auth: PromiseClient<typeof AuthService>;
    user: PromiseClient<typeof UserService>;
};

export function ApiClientsProvider({ children }: { children: React.ReactNode }) {
    const apiClients = useMemo((): ApiClients => {

        const cookie = getCookie("hlog_session");

        let interceptors: Interceptor[] | undefined = [];
        if (cookie) {
            interceptors = interceptors.concat(auther(cookie))
        }

        const transport = createConnectTransport({
            baseUrl: "http://localhost:8080",
            interceptors: interceptors,
        });
        const auth = createPromiseClient(AuthService, transport);
        const user = createPromiseClient(UserService, transport)
        return {
            auth: auth,
            user: user,
        }
    }, []);
    return (
        <ApiClientContext.Provider value={apiClients}>
            {children}
        </ApiClientContext.Provider>
    );
}

function getCookie(name: string): string | undefined {
    if (typeof document === 'undefined') {
        return undefined
    }
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (!parts || parts.length !== 2) {
        return undefined
    }
    const last = parts.pop()!
    return last.split(';').shift();
}

export function useApiClients(): ApiClients {
    return useContext(ApiClientContext)!;
}
