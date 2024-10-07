"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Code, ConnectError } from "@connectrpc/connect";
import { useApiClients } from "@context/api-provider";
import { PingResponse } from "api/js/svc/localhost/v1/service_pb";
import { ListAccountResponse_ListItem } from "api/js/svc/organization/v1/service_pb";

type AllAccounts = {
  hasLocalhost: PingResponse | null;
  listAccounts: ListAccountResponse_ListItem[];
};

const ListAccountContext = createContext<AllAccounts>({
  hasLocalhost: null,
  listAccounts: [],
});

export function ListAccountsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const apiClients = useApiClients();
  const [hasLocalhost, setHasLocalhost] = useState<PingResponse | null>(null);
  const [listAccounts, setListAccounts] = useState<
    ListAccountResponse_ListItem[]
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClients?.org.listAccount({});
        if (!res || !res.items) {
          return;
        }
        setListAccounts(res.items);
      } catch (err) {
        if (err instanceof ConnectError && err.code == Code.Unauthenticated) {
          console.log("need to auth");
        } else {
          console.error(err);
        }
      }
    })();
  }, [apiClients?.org]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClients?.localhost.ping({});
        if (!res) {
          setHasLocalhost(null);
          return;
        }
        setHasLocalhost(res);
      } catch (err) {
        if (err instanceof ConnectError && err.code == Code.Unknown) {
          console.log("localhost isn't running humanlog");
        } else {
          console.error(err);
        }
      }
    })();
  }, [apiClients?.localhost]);

  return (
    <ListAccountContext.Provider value={{ hasLocalhost, listAccounts }}>
      {children}
    </ListAccountContext.Provider>
  );
}

export function useAllAccounts(): AllAccounts {
  return useContext(ListAccountContext)!;
}
