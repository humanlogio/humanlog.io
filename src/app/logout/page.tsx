"use client";

import LoadingIndicator from "@/components/loading-indicator";
import { useEnvironmentStore } from "@/stores/environment-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePageStore } from "@/stores/page-store";
import { useUser } from "@/hooks/useUser";

export default function Logout() {
  const router = useRouter();
  const { setActiveEnvironment } = useEnvironmentStore();

  const { clearPage } = usePageStore();
  const { refetchUser } = useUser();

  useEffect(() => {
    setActiveEnvironment(undefined);
    refetchUser();
    clearPage();
    router.push("/");
  }, []);

  return <LoadingIndicator />;
}
