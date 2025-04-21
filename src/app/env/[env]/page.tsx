import EnvSwitcher from "@/components/env/env-switcher";
import { notFound } from "next/navigation";
import config from "@/features/config";
import LogInterface from "@/components/log-interface";

export default async function EnvironmentPage({
  params,
}: {
  params: Promise<{ env: string }>;
}) {
  const env = (await params).env;
  const isProd = config.NEXT_PUBLIC_IS_PROD;

  if (isProd) {
    notFound();
  }

  return (
    <main>
      <EnvSwitcher env={env}>
        <LogInterface />
      </EnvSwitcher>
    </main>
  );
}
