import { OrgDashboard } from "@/components/org/OrgDashboard";

interface OrganizationPageProps {
  params: Promise<{
    orgName: string;
  }>;
}

export default async function OrganizationPage(props: OrganizationPageProps) {
  const params = await props.params;
  return (
    <div className="container-h-full container py-6">
      <OrgDashboard orgName={params.orgName} />
    </div>
  );
}
