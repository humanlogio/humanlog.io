import { OrganizationDashboard } from "@/components/organizations/OrganizationDashboard";

interface OrganizationPageProps {
  params: {
    orgName: string;
  };
}

export default function OrganizationPage({ params }: OrganizationPageProps) {
  return (
    <div className="container h-[calc(100dvh-56px)] py-6">
      <OrganizationDashboard orgName={params.orgName} />
    </div>
  );
}
