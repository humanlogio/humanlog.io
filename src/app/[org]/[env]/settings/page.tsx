"use client";

import { useParams } from "next/navigation";
import { LocalhostSettings } from "@/app/[org]/[env]/settings/localhost-settings";
import { EnvSettings } from "@/app/[org]/[env]/settings/env-settings";
import { usePage } from "@/stores/page-store";
import { useEffect } from "react";

export default function EnvironmentSettings() {
  const params = useParams();
  const currentEnvSlug = params?.env;

  const { activePage, setActivePage } = usePage();

  useEffect(() => {
    setActivePage("settings");
  }, [activePage]);

  if (currentEnvSlug === "localhost") {
    return <LocalhostSettings />;
  }

  return <EnvSettings />;
}
