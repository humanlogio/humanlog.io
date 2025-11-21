"use client";

import { useEnvironmentStore } from "@/stores/environment-store";
import { useMemo } from "react";
import { getOrgEnvUrl } from "@/lib/utils/navigation";
import { authClient } from "@/lib/auth-client";

export const useSpanNavigation = (traceId?: string, spanId?: string) => {
  const { activeEnvironment } = useEnvironmentStore();
  const { useActiveOrganization } = authClient;
  const { data: activeOrganization } = useActiveOrganization();

  const traceUrl = useMemo(() => {
    if (!traceId || !activeOrganization) return undefined;
    return getOrgEnvUrl(
      activeOrganization,
      activeEnvironment,
      `traces?traceId=${encodeURIComponent(traceId)}`,
    );
  }, [activeOrganization, activeEnvironment, traceId, spanId]);

  const spanUrl = useMemo(() => {
    if (!spanId || !activeOrganization) return undefined;

    return getOrgEnvUrl(
      activeOrganization,
      activeEnvironment,
      `traces?spanId=${encodeURIComponent(spanId)}`,
    );
  }, [traceUrl, spanId]);

  return {
    traceUrl,
    spanUrl,
  };
};
