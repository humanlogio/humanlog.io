"use client";

import { useParams } from "next/navigation";
import { LocalhostSettings } from "@/app/[org]/[env]/settings/localhost-settings";
import { EnvSettings } from "@/app/[org]/[env]/settings/env-settings";

export default function EnvironmentSettings() {
  const params = useParams();
  const currentEnvSlug = params?.env;

  if (currentEnvSlug === "localhost") {
    return <LocalhostSettings />;
  }

  return <EnvSettings />;
}
