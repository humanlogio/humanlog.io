import { EnvironmentCreationForm } from "@/components/forms/EnvironmentCreationForm";

interface NewOrgEnvironmentPageProps {
  params: {
    orgName: string;
  };
}

export default function NewOrgEnvironmentPage({
  params,
}: NewOrgEnvironmentPageProps) {
  return (
    <div className="container-h-full container py-6">
      <h1 className="mb-6 text-3xl font-bold">
        Create New Environment for {params.orgName}
      </h1>
      <EnvironmentCreationForm orgId={params.orgName} />
    </div>
  );
}
