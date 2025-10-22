"use client";

import { useUser } from "@/hooks/useUser";
import { useEnvironmentStore } from "@/stores/environment-store";
import { useMemo } from "react";
import { getOrgEnvUrl } from "@/lib/utils/navigation";

export const useSpanNavigation = (traceId: string, spanId?: string) => {
  const { userData } = useUser();
  const { activeEnvironment } = useEnvironmentStore();

  const traceUrl = useMemo(() => {
    if (!userData || !traceId) return undefined;
    return getOrgEnvUrl(
      userData,
      activeEnvironment,
      `traces?traceId=${encodeURIComponent(traceId)}`,
    );
  }, [userData, activeEnvironment, traceId]);

  const spanUrl = useMemo(() => {
    if (!traceUrl) return undefined;
    return `${traceUrl}&spanId=${spanId}`;
  }, [traceUrl, spanId]);

  return {
    traceUrl,
    spanUrl,
  };
};

// 1. trace id는 무조건 clickable
// 2. span id는 trace id가 있는 경우에만 clickable
// 3. spanid가 clickable하지 않은 경우에도 표시는 되어야함.
