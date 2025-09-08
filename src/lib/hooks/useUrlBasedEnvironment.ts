// hooks/useUrlBasedEnvironment.ts
import { usePathname, useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useApiClients } from "@/context/api-provider";
import { useAllEnvironments } from "@/context/list-environments";

export const useUrlBasedEnvironment = () => {
  const pathname = usePathname();
  const params = useParams();
  const { setActiveEnvironment } = useApiClients();
  const { listEnvironments, localhostInfo } = useAllEnvironments();

  const lastSetEnvironment = useRef<string>("");

  useEffect(() => {
    const orgSlug = params?.org as string;
    const envSlug = params?.env as string;

    if (!orgSlug || !envSlug) return;

    const currentKey = `${orgSlug}/${envSlug}`;
    if (lastSetEnvironment.current === currentKey) return;

    if (envSlug === "localhost" && localhostInfo) {
      setActiveEnvironment(undefined);
      lastSetEnvironment.current = currentKey;
      return;
    }

    const targetEnvironment = listEnvironments.find(
      (env) => env.environment?.name === envSlug,
    );

    if (targetEnvironment) {
      setActiveEnvironment(targetEnvironment.environment);
      lastSetEnvironment.current = currentKey;
    }
  }, [pathname, params, listEnvironments, localhostInfo, setActiveEnvironment]);

  return {
    currentOrg: params?.org as string,
    currentEnv: params?.env as string,
    isLocalhost: params?.env === "localhost",
  };
};
