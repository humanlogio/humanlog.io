import { OrgSettingsForm } from "@/components/org/OrgSettingsForm";
import { SettingsShell } from "@/components/settings-shell";

export default function OrgSettingsPage({
  params,
}: {
  params: { orgName: string };
}) {
  const { orgName } = params;
  return (
    <SettingsShell activeSection="organization" orgName={orgName}>
      <h1 className="mb-6 text-3xl font-bold">
        Organization Settings / {params.orgName}
      </h1>
      <OrgSettingsForm orgName={params.orgName} />
    </SettingsShell>
  );
}
