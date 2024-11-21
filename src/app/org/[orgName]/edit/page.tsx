import { OrganizationSettingsForm } from "@/components/organizations/OrganizationSettingsForm";

interface EditOrgPageProps {
  params: { orgName: string };
}

export default function EditOrgPage({ params }: EditOrgPageProps) {
  return (
    <div className="container-h-full container py-6">
      <h1 className="mb-6 text-3xl font-bold">
        Organization Settings / {params.orgName}
      </h1>
      <OrganizationSettingsForm orgName={params.orgName} />
    </div>
  );
}
