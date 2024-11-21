import { OrganizationSettingsForm } from "@/components/organizations/OrganizationSettingsForm";
import { SettingsShell } from "@/components/settings-shell";

interface EditOrgPageProps {
  params: { orgName: string };
}

export default function EditOrgPage({ params }: EditOrgPageProps) {
  return (
    <SettingsShell activeSection="organization">
      <h1 className="mb-6 text-3xl font-bold">
        Organization Settings / {params.orgName}
      </h1>
      <OrganizationSettingsForm orgName={params.orgName} />
    </SettingsShell>
  );
}
