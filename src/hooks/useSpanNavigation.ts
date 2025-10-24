"use client";

import { useUser } from "@/hooks/useUser";
import { useEnvironmentStore } from "@/stores/environment-store";
import { useMemo } from "react";
import { getOrgEnvUrl } from "@/lib/utils/navigation";

export const useSpanNavigation = (traceId?: string, spanId?: string) => {
  const { userData } = useUser();
  const { activeEnvironment } = useEnvironmentStore();

  const traceUrl = useMemo(() => {
    if (!traceId || !userData) return undefined;
    return getOrgEnvUrl(
      userData,
      activeEnvironment,
      `traces?traceId=${encodeURIComponent(traceId)}`,
    );
  }, [userData, activeEnvironment, traceId, spanId]);

  const spanUrl = useMemo(() => {
    if (!spanId || !userData) return undefined;

    return getOrgEnvUrl(
      userData,
      activeEnvironment,
      `traces?spanId=${encodeURIComponent(spanId)}`,
    );
  }, [traceUrl, spanId]);

  return {
    traceUrl,
    spanUrl,
  };
};
