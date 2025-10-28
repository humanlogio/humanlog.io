// src/app/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingIndicator from "@/components/loading-indicator";
import { useEnvironmentStore } from "@/stores/environment-store";
import { getOrgEnvUrl } from "@/lib/utils/navigation";
import { usePing } from "@/hooks/usePing";
import { useUser } from "@/hooks/useUser";
import posthog from "posthog-js";

export default function Login() {
  const router = useRouter();
  const { activeEnvironment, setActiveEnvironment } = useEnvironmentStore();
  const { localhostData } = usePing();
  const { refetchUser, userData } = useUser();
  const [posthogReady, setPosthogReady] = useState(false);

  useEffect(() => {
    refetchUser();
    setActiveEnvironment(undefined);
  }, []);

  useEffect(() => {
    if (!posthog || !userData?.user?.email) return;

    posthog.identify(userData.user.email, {
      email: userData.user.email,
      name: userData.user.username,
    });
    setPosthogReady(true);
  }, [posthog, userData]);

  useEffect(() => {
    if (!userData || !posthogReady) return;

    const url = getOrgEnvUrl(userData, activeEnvironment);
    router.replace(url);
  }, [userData, localhostData, posthogReady]);

  return <LoadingIndicator />;
}
