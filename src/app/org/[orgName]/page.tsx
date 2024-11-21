import { OrganizationDashboard } from "@/components/organizations/OrganizationDashboard";

interface OrganizationPageProps {
  params: Promise<{
    orgName: string;
  }>;
}

export default async function OrganizationPage(props: OrganizationPageProps) {
  const params = await props.params;
  return (
    <div className="container-h-full container py-6">
      <OrganizationDashboard orgName={params.orgName} />
    </div>
  );
}
