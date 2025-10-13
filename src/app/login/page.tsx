"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingIndicator from "@/components/loading-indicator";
import { useEnvironmentStore } from "@/stores/environment-store";
import { getOrgEnvUrl } from "@/lib/utils/navigation";
import { usePing } from "@/hooks/usePing";
import { useUser } from "@/hooks/useUser";

export default function Login() {
  const router = useRouter();
  const { activeEnvironment, setActiveEnvironment } = useEnvironmentStore();
  const { localhostData } = usePing();
  const { refetchUser, userData } = useUser();

  useEffect(() => {
    refetchUser();
    setActiveEnvironment(undefined);

    if (!userData) return;
    const url = getOrgEnvUrl(userData, activeEnvironment);
    router.replace(url);
  }, [userData, localhostData]);

  return <LoadingIndicator />;
}
