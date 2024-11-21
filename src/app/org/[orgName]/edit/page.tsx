import { SettingsShell } from "@/components/settings-shell";
import { OrgSettingsForm } from "@/components/org/org-settings-form";

export default async function OrgSettingsPage(props: {
  params: Promise<{ orgName: string }>;
}) {
  const params = await props.params;
  const { orgName } = params;
  return (
    <SettingsShell activeSection="organization" orgName={orgName}>
      <h1 className="mb-6 text-3xl font-bold">
        Organization Settings / {orgName}
      </h1>
      <OrgSettingsForm orgName={orgName} />
    </SettingsShell>
  );
}
