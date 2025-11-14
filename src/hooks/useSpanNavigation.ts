"use client";

import { useUser } from "@/hooks/useUser";
import { useEnvironmentStore } from "@/stores/environment-store";
import { useMemo } from "react";
import { getOrgEnvUrl } from "@/lib/utils/navigation";
import { useOrganizationStore } from "@/stores/user-store";

export const useSpanNavigation = (traceId?: string, spanId?: string) => {
  const { activeEnvironment } = useEnvironmentStore();
  const { currentOrganization } = useOrganizationStore();

  const traceUrl = useMemo(() => {
    if (!traceId || !currentOrganization) return undefined;
    return getOrgEnvUrl(
      currentOrganization,
      activeEnvironment,
      `traces?traceId=${encodeURIComponent(traceId)}`,
    );
  }, [currentOrganization, activeEnvironment, traceId, spanId]);

  const spanUrl = useMemo(() => {
    if (!spanId || !currentOrganization) return undefined;

    return getOrgEnvUrl(
      currentOrganization,
      activeEnvironment,
      `traces?spanId=${encodeURIComponent(spanId)}`,
    );
  }, [traceUrl, spanId]);

  return {
    traceUrl,
    spanUrl,
  };
};
