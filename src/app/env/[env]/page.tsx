"use client";

import LogInterface from "@/components/log-interface";

export default async function EnvironmentPage({
  params,
}: {
  params: Promise<{ env: string }>;
}) {
  const env = (await params).env;
  return (
    <main>
      <LogInterface env={env} />
    </main>
  );
}
