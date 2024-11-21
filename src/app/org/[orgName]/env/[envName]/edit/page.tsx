import { SettingsShell } from "@/components/settings-shell";

export default function EnvSettingsPage({
  params,
}: {
  params: { orgName: string };
}) {
  const { orgName } = params;

  return (
    <SettingsShell activeSection="environment" orgName={orgName}>
      <h1 className="mb-6 text-3xl font-bold">Environment Settings</h1>
      {/* Add your environment settings form or content here */}
      <p>Manage your environment settings here.</p>
    </SettingsShell>
  );
}
