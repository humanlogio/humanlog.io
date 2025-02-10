import EnvSwitcher from "@/components/env/env-switcher";
import LogInterface from "@/components/env/log-interface";

export default function EnvironmentPage({
  params,
}: {
  params: { env: string };
}) {
  const env = params.env;

  return (
    <main>
      <EnvSwitcher env={env}>
        <LogInterface />
      </EnvSwitcher>
    </main>
  );
}
