"use client";

import { ReactNode, useEffect } from "react";
import { useApiClients } from "@/context/api-provider";
import { useRouter } from "next/router";

const EnvSwitcher = ({
  env,
  children,
}: {
  env?: string;
  children: ReactNode;
}) => {
  const { apiClients, setActiveEnvironment } = useApiClients();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        if (env && apiClients) {
          const environment = await apiClients.org.getEnvironment({
            by: {
              value: env,
              case: "name",
            },
          });
          setActiveEnvironment(environment.environment?.id);
        }
      } catch (e) {
        console.error("Environment not found", e);
        router.push("/");
      }
    })();
  }, [env, apiClients, router, setActiveEnvironment]);

  return children;
};

export default EnvSwitcher;
