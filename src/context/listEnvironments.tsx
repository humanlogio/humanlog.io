"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Code, ConnectError } from "@connectrpc/connect";
import { useApiClients } from "@/context/api-provider";
import { PingResponse } from "api/js/svc/localhost/v1/service_pb";
import { ListEnvironmentResponse_ListItem } from "api/js/svc/organization/v1/service_pb";
import { User } from "api/js/types/v1/user_pb";
import { Organization } from "api/js/types/v1/organization_pb";
import { Cursor } from "api/js/types/v1/cursor_pb";

type AllEnvironments = {
  user: User | null;
  hasLocalhost: PingResponse | null;
  listEnvironments: ListEnvironmentResponse_ListItem[];
};

const ListEnvironmentContext = createContext<AllEnvironments>({
  user: null,
  hasLocalhost: null,
  listEnvironments: [],
});

export function ListEnvironmentsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { apiClients, setActiveEnvironment } = useApiClients();
  const [hasLocalhost, setHasLocalhost] = useState<PingResponse | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [listEnvironments, setListEnvironments] = useState<
    ListEnvironmentResponse_ListItem[]
  >([]);

  const [environmentPage, setEnvironmentPage] = useState<Cursor>(new Cursor());

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
        const res = await apiClients?.org.listEnvironment({
          organizationId: currentOrg?.id,
          cursor: environmentPage,
          limit: 10,
        });
        if (!res || !res.items) {
          setListEnvironments([]);
          setActiveEnvironment(undefined);
          return;
        }
        setListEnvironments(res.items);
      } catch (err) {
        if (err instanceof ConnectError && err.code == Code.Unauthenticated) {
          console.log("need to auth");
        } else {
          console.error(err);
        }
      }
    })();
  }, [apiClients?.org, currentOrg, environmentPage, setActiveEnvironment]);

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
    <ListEnvironmentContext.Provider
      value={{ user, hasLocalhost, listEnvironments }}
    >
      {children}
    </ListEnvironmentContext.Provider>
  );
}

export function useAllEnvironments(): AllEnvironments {
  return useContext(ListEnvironmentContext)!;
}
