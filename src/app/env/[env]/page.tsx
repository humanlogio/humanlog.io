import EnvSwitcher from "@/components/env/env-switcher";
import LogInterface from "@/components/env/log-interface";
import { notFound } from "next/navigation";
import config from "@/features/config";

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
