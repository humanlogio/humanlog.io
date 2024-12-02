"use client";

import EnvSwitcher from "@/components/env-switcher";
import LogInterface from "@/components/log-interface";

export default async function EnvironmentPage({
  params,
}: {
  params: Promise<{ env: string }>;
}) {
  const env = (await params).env;
  return (
    <main>
      <EnvSwitcher env={env}>
        <LogInterface />
      </EnvSwitcher>
    </main>
  );
}
