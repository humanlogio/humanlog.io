"use client";

import { useParams } from "next/navigation";
import { LocalhostSettings } from "@/app/[org]/[env]/settings/localhost-settings";
import { EnvSettings } from "@/app/[org]/[env]/settings/env-settings";
import { usePageStore } from "@/stores/page-store";
import { useEffect } from "react";
import { useEnvironmentStore } from "@/stores/environment-store";

export default function EnvironmentSettings() {
  const params = useParams();
  const currentEnvSlug = params?.env;
  const { activeEnvironment } = useEnvironmentStore();
  const { activePage, setActivePage } = usePageStore();

  useEffect(() => {
    setActivePage("settings");
  }, [activePage]);

  if (!activeEnvironment) {
    return;
  }

  if (activeEnvironment.type === "localhost") {
    return <LocalhostSettings />;
  }

  if (activeEnvironment.type === "hosted") {
    return <EnvSettings activeEnvironment={activeEnvironment.data} />;
  }
}
