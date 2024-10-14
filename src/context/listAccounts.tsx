"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Code, ConnectError } from "@connectrpc/connect";
import { useApiClients } from "@/context/api-provider";
import { PingResponse } from "api/js/svc/localhost/v1/service_pb";
import { ListAccountResponse_ListItem } from "api/js/svc/organization/v1/service_pb";
import { User } from "api/js/types/v1/user_pb";
import { Organization } from "api/js/types/v1/organization_pb";
import { Cursor } from "api/js/types/v1/cursor_pb";

type AllAccounts = {
  user: User | null;
  hasLocalhost: PingResponse | null;
  listAccounts: ListAccountResponse_ListItem[];
};

const ListAccountContext = createContext<AllAccounts>({
  user: null,
  hasLocalhost: null,
  listAccounts: [],
});

export function ListAccountsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { apiClients, setActiveAccount } = useApiClients();
  const [hasLocalhost, setHasLocalhost] = useState<PingResponse | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [listAccounts, setListAccounts] = useState<
    ListAccountResponse_ListItem[]
  >([]);

  const [accountPage, setAccountPage] = useState<Cursor>(new Cursor());

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClients?.user.whoami({});
        if (!res || !res.user || !res.currentOrganization) {
          return;
        }
        setUser(res.user);
        setCurrentOrg(res.currentOrganization);
      } catch (err) {
        if (err instanceof ConnectError && err.code == Code.Unauthenticated) {
          console.log("need to auth");
        } else {
          console.error(err);
        }
      }
    })();
  }, [apiClients?.user]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClients?.org.listAccount({
          organizationId: currentOrg?.id,
          cursor: accountPage,
          limit: 10,
        });
        if (!res || !res.items) {
          setListAccounts([]);
          setActiveAccount(undefined);
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
  }, [apiClients?.org, currentOrg, accountPage]);

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
    <ListAccountContext.Provider value={{ user, hasLocalhost, listAccounts }}>
      {children}
    </ListAccountContext.Provider>
  );
}

export function useAllAccounts(): AllAccounts {
  return useContext(ListAccountContext)!;
}
