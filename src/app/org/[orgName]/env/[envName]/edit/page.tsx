import { SettingsShell } from "@/components/settings-shell";

export default async function EnvSettingsPage(props: {
  params: Promise<{ orgName: string }>;
}) {
  const params = await props.params;
  const { orgName } = params;

  return (
    <SettingsShell activeSection="environment">
      <h1 className="mb-6 text-3xl font-bold">Environment Settings</h1>
      {/* Add your environment settings form or content here */}
      <p>Manage your environment settings here.</p>
    </SettingsShell>
  );
}
